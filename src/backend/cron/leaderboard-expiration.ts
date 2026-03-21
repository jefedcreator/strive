import cron from 'node-cron';
import { db } from '@/server/db';
import { RewardType } from '@prisma/client';
import { emailService } from '../services/email';
import { parsePace } from '@/utils';

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

    console.log(`[Cron] Found ${expiredLeaderboards.length} expired leaderboards to process.`);

    for (const leaderboard of expiredLeaderboards) {
      let qualifiedEntries = leaderboard.entries;
      
      if (leaderboard.type === 'DISTANCE') {
        qualifiedEntries = qualifiedEntries.filter(
          (e) => e.runDistance && e.runDistance > 0
        );
        qualifiedEntries.sort(
          (a, b) => (b.runDistance ?? 0) - (a.runDistance ?? 0)
        );
      } else if (leaderboard.type === 'PACE') {
        const isZeroPace = (pace: string | null) =>
          !pace || pace === '0' || pace === '0:00' || pace === '00:00';
        qualifiedEntries = qualifiedEntries.filter((e) => !isZeroPace(e.runPace));
        qualifiedEntries.sort(
          (a, b) => parsePace(a.runPace) - parsePace(b.runPace)
        );
      } else {
        qualifiedEntries = qualifiedEntries.filter((e) => e.score > 0);
        qualifiedEntries.sort((a, b) => b.score - a.score);
      }

      qualifiedEntries = qualifiedEntries.slice(0, 3);

      if (qualifiedEntries.length === 0) {
        // Mark the leaderboard as inactive so we don't process it again
        await db.leaderboard.update({
          where: { id: leaderboard.id },
          data: { isActive: false },
        });
        console.log(`[Cron] Leaderboard ${leaderboard.id} expired with no qualified entries. Marked inactive.`);
        continue;
      }

      const contextType = leaderboard.clubId ? 'leaderboard' : 'challenge';

      const ranks = [RewardType.GOLD, RewardType.SILVER, RewardType.BRONZE];

      for (let i = 0; i < qualifiedEntries.length; i++) {
        const entry = qualifiedEntries[i];
        const badgeType = ranks[i];
        if (!entry?.user) return;

        // Ensure the reward definition exists
        let reward = await db.reward.findFirst({
          where: {
            leaderboardId: leaderboard.id,
            type: badgeType,
          },
        });

        const placeLabel = i === 0 ? '1st' : i === 1 ? '2nd' : '3rd';
        const typeLabel = leaderboard.clubId ? 'Leaderboard' : 'Challenge';

        const metricText =
          leaderboard.type === 'DISTANCE'
            ? ` with a distance of ${entry.runDistance}km`
            : leaderboard.type === 'PACE'
            ? ` with a pace of ${entry.runPace}/km`
            : '';

        if (!reward) {
          reward = await db.reward.create({
            data: {
              type: badgeType || RewardType.GOLD,
              title: `${placeLabel} Place — ${leaderboard.name}`,
              description: `Earned ${placeLabel} place in the ${typeLabel} "${leaderboard.name}"${metricText}`,
              leaderboardId: leaderboard.id,
              clubId: leaderboard.clubId,
            },
          });
        }

        // Award to user if they don't already have it
        const existingUserReward = await db.userReward.findUnique({
          where: {
            userId_rewardId: {
              userId: entry?.userId,
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

          // Create In-App Notification
          await db.notification.create({
            data: {
              userId: entry.userId,
              message: `🏆 You earned ${placeLabel} place in "${leaderboard.name}"! View your reward.`,
              type: 'reward',
              leaderboardId: leaderboard.id,
            },
          });

          // Build URLs for the email
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://usestrive.run';
          const rewardUrl = `${baseUrl}/rewards/${userReward.id}`;
          
          const badgeTypeParam = (badgeType || RewardType.GOLD).toLowerCase();
          const badgeParams = new URLSearchParams({
            type: badgeTypeParam,
            title: reward.title,
            ...(reward.description ? { subtitle: reward.description } : {}),
            ...(reward.milestone ? { milestone: String(reward.milestone) } : {}),
          });
          const badgeUrl = `${baseUrl}/api/rewards/badge?${badgeParams.toString()}`;

          // Send Email
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

      // Mark the leaderboard as inactive so we don't process it again
      await db.leaderboard.update({
        where: { id: leaderboard.id },
        data: { isActive: false },
      });

      console.log(`[Cron] Processed leaderboard: ${leaderboard.id} (${leaderboard.name})`);
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
