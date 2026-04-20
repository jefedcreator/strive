import { db } from '@/server/db';
import type { RunData } from '@/types';
import { checkClubMilestones } from '@/backend/services/rewards';
import { syncUserXP } from '@/backend/services/xp';

export function getRunDedupId(
  run: Pick<RunData, 'date' | 'distance' | 'duration'>
): string {
  const timestamp = new Date(run.date).getTime();
  return `${timestamp}-${run.distance}-${run.duration}`;
}

function assignRunDedupIds(runs: RunData[]): RunData[] {
  return runs.map((run) => ({ ...run, id: getRunDedupId(run) }));
}

/**
 * Shared scoring / leaderboard-update logic.
 *
 * Given a user ID and their fetched runs, this function:
 *  1. Deduplicates runs and assigns consistent IDs
 *  2. Updates all active UserLeaderboard entries for the user
 *  3. Checks club milestones
 *  4. Syncs XP
 *
 * Used by both `GET /api/runs` (user-triggered) and the `sync-runs` cron job.
 */
export async function processRunsForUser(
  userId: string,
  runs: RunData[]
): Promise<RunData[]> {
  if (runs.length === 0) return runs;

  // Assign a consistent ID based on inherent run attributes
  runs = assignRunDedupIds(runs);

  // Deduplicate runs by id
  const unique = Array.from(new Map(runs.map((r) => [r.id, r])).values());

  const memberships = await db.userLeaderboard.findMany({
    where: {
      userId,
      leaderboard: {
        OR: [{ expiryDate: null }, { expiryDate: { gt: new Date() } }],
      },
    },
    select: {
      id: true,
      createdAt: true,
      runId: true,
      runDistance: true,
      runDuration: true,
      leaderboard: {
        select: { type: true, createdAt: true, expiryDate: true },
      },
    },
  });

  // Helper: parse pace string "M:SS" → total minutes
  const parsePace = (pace: string): number => {
    const [min, sec] = pace.split(':').map(Number);
    return (min ?? 0) + (sec ?? 0) / 60;
  };

  // For each membership, compute stats from runs after the join date
  await Promise.all(
    memberships.map(async (membership) => {
      const leaderboardStart = new Date(membership.leaderboard.createdAt);
      const leaderboardEnd = membership.leaderboard.expiryDate
        ? new Date(membership.leaderboard.expiryDate)
        : null;

      const validRuns = unique.filter((r) => {
        const runDate = new Date(r.date);
        const isAfterStart = runDate >= leaderboardStart;
        const isBeforeEnd = leaderboardEnd ? runDate <= leaderboardEnd : true;
        return isAfterStart && isBeforeEnd;
      });

      if (validRuns.length === 0) return;

      const latest = validRuns.reduce((prev, curr) =>
        curr.date > prev.date ? curr : prev
      );

      const totalDistance = validRuns.reduce((sum, r) => sum + r.distance, 0);
      const totalDuration = validRuns.reduce((sum, r) => sum + r.duration, 0);

      // Skip DB update if this leaderboard already has this run as its latest AND stats match
      if (
        membership.runId === latest.id &&
        membership.runDistance === parseFloat(totalDistance.toFixed(2)) &&
        membership.runDuration === parseFloat(totalDuration.toFixed(2))
      )
        return;

      const avgPaceMinPerKm =
        totalDistance > 0 ? totalDuration / totalDistance : 0;
      const paceMin = Math.floor(avgPaceMinPerKm);
      const paceSec = Math.round((avgPaceMinPerKm - paceMin) * 60);
      const avgPace = `${String(paceMin).padStart(2, '0')}:${String(paceSec).padStart(2, '0')}`;

      // Compute score based on leaderboard type
      const leaderboardType = membership.leaderboard.type;
      let score: number;

      if (leaderboardType === 'PACE') {
        // Best (lowest) pace wins — find the run with the fastest pace
        const bestPaceRun = validRuns.reduce((best, r) => {
          const bestPaceVal = parsePace(best.pace);
          const currentPaceVal = parsePace(r.pace);
          return currentPaceVal < bestPaceVal ? r : best;
        });
        const bestPaceVal = parsePace(bestPaceRun.pace);
        // Invert so higher score = faster pace; ORDER BY score DESC works
        score = bestPaceVal > 0 ? Math.round(1_000_000 / bestPaceVal) : 0;
      } else if (leaderboardType === 'COMBINED') {
        // EFFORT: Distance (primary) + Inverse of Pace (tie-breaker)
        // Scaled so 1km = 1000 points, and pace adds up to ~500 points (for a 2:00 pace)
        const paceScore = avgPaceMinPerKm > 0 ? 1000 / avgPaceMinPerKm : 0;
        score = Math.round(totalDistance * 1000 + paceScore);
      } else {
        // DISTANCE: higher total distance = higher score
        score = Math.round(totalDistance * 1000);
      }

      await db.userLeaderboard.update({
        where: { id: membership.id },
        data: {
          score,
          runId: latest.id,
          runName: latest.name,
          runDate: latest.date,
          runDistance: parseFloat(totalDistance.toFixed(2)),
          runDuration: parseFloat(totalDuration.toFixed(2)),
          runPace: avgPace,
          lastScoreDate: new Date(latest.date),
        },
      });
    })
  );

  // Check club milestones for all clubs the user belongs to
  const userClubs = await db.userClub.findMany({
    where: { userId, isActive: true },
    select: { clubId: true },
  });

  for (const uc of userClubs) {
    checkClubMilestones(uc.clubId).catch(console.error);
  }

  // Sync XP from these runs
  syncUserXP(userId, runs).catch(console.error);

  return runs;
}
