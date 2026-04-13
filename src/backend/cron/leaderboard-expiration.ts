import cron from 'node-cron';
import { db } from '@/server/db';
import { RewardType } from '@prisma/client';
import { emailService } from '../services/email';
import { parsePace } from '@/utils';

/**
 * Helper: checks if a pace string is effectively zero/missing.
 */
const isZeroPace = (pace: string | null) =>
  !pace || pace === '0' || pace === '0:00' || pace === '00:00';

// Type helper for the entry shape used in awardTopEntries
type ExpiredEntry = {
  id: string;
  userId: string;
  score: number;
  runDistance: number | null;
  runPace: string | null;
  user: { email: string } & Record<string, unknown>;
  [key: string]: unknown;
};

/**
 * Helper: award top-3 entries for a given metric pass.
 * @param metricLabel — 'Distance' | 'Pace' | undefined (for single-metric types)
 */
async function awardTopEntries(
  leaderboard: {
    id: string;
    name: string;
    clubId: string | null;
    type: string;
  },
  rankedEntries: ExpiredEntry[],
  metricLabel?: string
) {
  const contextType = leaderboard.clubId ? 'leaderboard' : 'challenge';
  const typeLabel = leaderboard.clubId ? 'Leaderboard' : 'Challenge';
  const ranks = [RewardType.GOLD, RewardType.SILVER, RewardType.BRONZE];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://usestrive.run';

  for (let i = 0; i < rankedEntries.length; i++) {
    const entry = rankedEntries[i];
    const badgeType = ranks[i];
    if (!entry?.user) return;

    const placeLabel = i === 0 ? '1st' : i === 1 ? '2nd' : '3rd';

    // Build metric-specific text for descriptions
    const metricText =
      metricLabel === 'Distance'
        ? ` with a distance of ${entry.runDistance}km`
        : metricLabel === 'Pace'
          ? ` with a pace of ${entry.runPace}/km`
          : leaderboard.type === 'DISTANCE'
            ? ` with a distance of ${entry.runDistance}km`
            : leaderboard.type === 'PACE'
              ? ` with a pace of ${entry.runPace}/km`
              : '';

    // For COMBINED, include the metric in the title; for single-metric, omit it
    const titleSuffix = metricLabel ? ` (${metricLabel})` : '';
    const rewardTitle = `${placeLabel} Place${titleSuffix} — ${leaderboard.name}`;

    // Always create a new reward per metric pass (COMBINED creates separate distance + pace rewards)
    let reward = await db.reward.findFirst({
      where: {
        leaderboardId: leaderboard.id,
        type: badgeType,
        title: rewardTitle,
      },
    });

    if (!reward) {
      reward = await db.reward.create({
        data: {
          type: badgeType || RewardType.GOLD,
          title: rewardTitle,
          description: `Earned ${placeLabel} place${titleSuffix} in the ${typeLabel} "${leaderboard.name}"${metricText}`,
          leaderboardId: leaderboard.id,
          clubId: leaderboard.clubId,
        },
      });
    }

    // Award to user if they don't already have it
    const existingUserReward = await db.userReward.findUnique({
      where: {
        userId_rewardId: {
          userId: entry.userId,
          rewardId: reward.id,
        },
      },
    });

    if (!existingUserReward) {
      const userReward = await db.userReward.create({
        data: {
          userId: entry.userId,
          rewardId: reward.id,
        },
      });

      // Notification message includes the metric for COMBINED
      const notifMetric = metricLabel ? ` (${metricLabel})` : '';
      await db.notification.create({
        data: {
          userId: entry.userId,
          message: `🏆 You earned ${placeLabel} place${notifMetric} in "${leaderboard.name}"! View your reward.`,
          type: 'reward',
          leaderboardId: leaderboard.id,
        },
      });

      // Build URLs for the email
      const rewardUrl = `${baseUrl}/rewards/${userReward.id}`;
      const badgeTypeParam = (badgeType || RewardType.GOLD).toLowerCase();
      const badgeParams = new URLSearchParams({
        type: badgeTypeParam,
        title: reward.title,
        ...(reward.description ? { subtitle: reward.description } : {}),
        ...(reward.milestone ? { milestone: String(reward.milestone) } : {}),
      });
      const badgeUrl = `${baseUrl}/api/rewards/badge?${badgeParams.toString()}`;

      if (entry.user.email) {
        await emailService.sendRewardEmail(
          entry.user.email,
          badgeType || RewardType.GOLD,
          leaderboard.name,
          contextType,
          badgeUrl,
          rewardUrl,
          metricText
        );
      }
    }
  }
}

export const processExpiredLeaderboards = async () => {
  try {
    console.log('[Cron] Starting processExpiredLeaderboards...');

    const expiredLeaderboards = await db.leaderboard.findMany({
      where: {
        expiryDate: { lte: new Date() },
        isActive: true,
      },
      include: {
        entries: {
          where: { isActive: true },
          include: {
            user: true,
          },
        },
      },
    });

    console.log(
      `[Cron] Found ${expiredLeaderboards.length} expired leaderboards to process.`
    );

    for (const leaderboard of expiredLeaderboards) {
      const allEntries = leaderboard.entries;

      if (leaderboard.type === 'COMBINED') {
        // ── Pass 1: Distance (top 3 by runDistance desc) ──
        const distanceEntries = allEntries
          .filter((e) => e.runDistance && e.runDistance > 0)
          .sort((a, b) => (b.runDistance ?? 0) - (a.runDistance ?? 0))
          .slice(0, 3);

        // ── Pass 2: Pace (top 3 by runPace asc — lower is better) ──
        const paceEntries = allEntries
          .filter((e) => !isZeroPace(e.runPace))
          .sort((a, b) => parsePace(a.runPace) - parsePace(b.runPace))
          .slice(0, 3);

        if (distanceEntries.length === 0 && paceEntries.length === 0) {
          await db.leaderboard.update({
            where: { id: leaderboard.id },
            data: { isActive: false },
          });
          console.log(
            `[Cron] Leaderboard ${leaderboard.id} expired with no qualified entries. Marked inactive.`
          );
          continue;
        }

        if (distanceEntries.length > 0) {
          await awardTopEntries(leaderboard, distanceEntries, 'Distance');
        }
        if (paceEntries.length > 0) {
          await awardTopEntries(leaderboard, paceEntries, 'Pace');
        }
      } else {
        // ── Single-metric: DISTANCE or PACE ──
        let qualifiedEntries = allEntries;

        if (leaderboard.type === 'DISTANCE') {
          qualifiedEntries = qualifiedEntries.filter(
            (e) => e.runDistance && e.runDistance > 0
          );
          qualifiedEntries.sort(
            (a, b) => (b.runDistance ?? 0) - (a.runDistance ?? 0)
          );
        } else if (leaderboard.type === 'PACE') {
          qualifiedEntries = qualifiedEntries.filter(
            (e) => !isZeroPace(e.runPace)
          );
          qualifiedEntries.sort(
            (a, b) => parsePace(a.runPace) - parsePace(b.runPace)
          );
        } else {
          qualifiedEntries = qualifiedEntries.filter((e) => e.score > 0);
          qualifiedEntries.sort((a, b) => b.score - a.score);
        }

        qualifiedEntries = qualifiedEntries.slice(0, 3);

        if (qualifiedEntries.length === 0) {
          await db.leaderboard.update({
            where: { id: leaderboard.id },
            data: { isActive: false },
          });
          console.log(
            `[Cron] Leaderboard ${leaderboard.id} expired with no qualified entries. Marked inactive.`
          );
          continue;
        }

        await awardTopEntries(leaderboard, qualifiedEntries);
      }

      // Mark the leaderboard as inactive so we don't process it again
      await db.leaderboard.update({
        where: { id: leaderboard.id },
        data: { isActive: false },
      });

      console.log(
        `[Cron] Processed leaderboard: ${leaderboard.id} (${leaderboard.name})`
      );
    }

    console.log('[Cron] Finished processExpiredLeaderboards.');
  } catch (error) {
    console.error('[Cron] Error processing expired leaderboards:', error);
  }
};

// Schedule job to run at midnight every day
cron.schedule('0 0 * * *', () => {
  void processExpiredLeaderboards();
});
