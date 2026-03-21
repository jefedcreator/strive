import { authMiddleware, withMiddleware } from '@/backend/middleware';
import type { AuthRequest } from '@/backend/middleware/types';
import { nrc } from '@/backend/services/nrc';
import { stravaService } from '@/backend/services/strava';
import { db } from '@/server/db';
import { type ApiResponse, type RunData } from '@/types';
import { checkClubMilestones } from '@/backend/services/rewards';
import { syncUserXP } from '@/backend/services/xp';

/**
 * @bodyDescription Get user's runs from connected platforms. Supports Nike Run Club (NRC) and Strava activities
 */
export const GET = withMiddleware(
  async (request: AuthRequest) => {
    const user = request.user!;
    let runs: RunData[] = [];

    if (user.type === 'NRC') {
      runs = await nrc.fetchRuns(user.access_token ?? '');
    } else if (user.type === 'STRAVA') {
      runs = await stravaService.fetchAllActivities(user.access_token ?? '');
    }

    if (runs.length > 0) {
      // Assign a consistent ID based on inherent run attributes
      runs = runs.map((r) => {
        const timestamp = new Date(r.date).getTime();
        return {
          ...r,
          id: `${timestamp}-${r.distance}-${r.duration}`,
        };
      });

      // Deduplicate runs by id
      const unique = Array.from(new Map(runs.map((r) => [r.id, r])).values());

      const memberships = await db.userLeaderboard.findMany({
        where: {
          userId: user.id,
          leaderboard: {
            OR: [{ expiryDate: null }, { expiryDate: { gt: new Date() } }],
          },
        },
        select: { id: true, createdAt: true, runId: true, leaderboard: { select: { type: true } } },
      });

      // Helper: parse pace string "M:SS" → total minutes
      const parsePace = (pace: string): number => {
        const [min, sec] = pace.split(':').map(Number);
        return (min ?? 0) + (sec ?? 0) / 60;
      };

      // For each membership, compute stats from runs after the join date
      await Promise.all(
        memberships.map(async (membership) => {
          const sinceJoin = unique.filter(
            (r) => new Date(r.date) >= membership.createdAt
          );

          if (sinceJoin.length === 0) return;

          const latest = sinceJoin.reduce((prev, curr) =>
            curr.date > prev.date ? curr : prev
          );

          console.log('latest', latest);
          console.log('membership.runId', membership.runId);
          console.log('latest.runId', latest.id);

          // Skip DB update if this leaderboard already has this run as its latest
          if (membership.runId === latest.id) return;

          const totalDistance = sinceJoin.reduce(
            (sum, r) => sum + r.distance,
            0
          );
          const totalDuration = sinceJoin.reduce(
            (sum, r) => sum + r.duration,
            0
          );

          const avgPaceMinPerKm =
            totalDistance > 0 ? totalDuration / totalDistance : 0;
          const paceMin = Math.floor(avgPaceMinPerKm);
          const paceSec = Math.round((avgPaceMinPerKm - paceMin) * 60);
          const avgPace = `${paceMin}:${String(paceSec).padStart(2, '0')}`;

          // Compute score based on leaderboard type
          const leaderboardType = membership.leaderboard.type;
          let score: number;

          if (leaderboardType === 'PACE') {
            // Best (lowest) pace wins — find the run with the fastest pace
            const bestPaceRun = sinceJoin.reduce((best, r) => {
              const bestPaceVal = parsePace(best.pace);
              const currentPaceVal = parsePace(r.pace);
              return currentPaceVal < bestPaceVal ? r : best;
            });
            const bestPaceVal = parsePace(bestPaceRun.pace);
            // Invert so higher score = faster pace; ORDER BY score DESC works
            score = bestPaceVal > 0 ? Math.round(1_000_000 / bestPaceVal) : 0;
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
        where: { userId: user.id, isActive: true },
        select: { clubId: true },
      });

      for (const uc of userClubs) {
        checkClubMilestones(uc.clubId).catch(console.error);
      }

      // Sync XP from these runs
      syncUserXP(user.id, runs).catch(console.error);
    }

    const response: ApiResponse<RunData[]> = {
      status: 200,
      message: 'Runs retrieved successfully',
      data: runs,
    };

    return Response.json(response);
  },
  [authMiddleware]
);
