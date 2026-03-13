import cron from 'node-cron';
import { db } from '@/server/db';
import { RewardType } from '@prisma/client';
import { sendRewardEmail } from '../services/email';

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
          orderBy: { score: 'desc' },
          take: 3,
          include: {
            user: true,
          },
        },
      },
    });

    console.log(`[Cron] Found ${expiredLeaderboards.length} expired leaderboards to process.`);

    for (const leaderboard of expiredLeaderboards) {
      const topEntries = leaderboard.entries;
      const contextType = leaderboard.clubId ? 'leaderboard' : 'challenge';

      const ranks = [RewardType.GOLD, RewardType.SILVER, RewardType.BRONZE];

      for (let i = 0; i < topEntries.length; i++) {
        const entry = topEntries[i];
        const badgeType = ranks[i];
        if (!entry?.user) return;

        // Ensure the reward definition exists
        let reward = await db.reward.findFirst({
          where: {
            leaderboardId: leaderboard.id,
            type: badgeType,
          },
        });

        if (!reward) {
          reward = await db.reward.create({
            data: {
              type: badgeType || RewardType.GOLD,
              title: `${badgeType} Badge - ${leaderboard.name}`,
              description: `Awarded for finishing in the top 3 of ${leaderboard.name}.`,
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
          await db.userReward.create({
            data: {
              userId: entry.userId,
              rewardId: reward.id,
            },
          });

          // Send Email
          if (entry.user.email) {
            await sendRewardEmail(
              entry.user.email,
              badgeType || RewardType.GOLD,
              leaderboard.name,
              contextType
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
