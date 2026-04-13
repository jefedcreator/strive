import { PrismaClient, RewardType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = '698dd9a66281635d46e81f36';

  console.log(`🚀 Seeding rewards and status for user ${userId}...`);

  try {
    // 1. Ensure user exists and upgrade stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error(`❌ User ${userId} not found.`);
      return;
    }

    console.log(`👤 Found user: ${user.fullname || user.username}`);

    // Update to "Elite" tier (15k+ XP) and "Iron Runner" streak (4+ weeks)
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: 18500,
        currentStreak: 5,
        longestStreak: 5,
        lastRunDate: new Date(),
      },
    });
    console.log(
      `✨ Stats updated: 18,500 XP (Elite), 5 Week Streak (Iron Runner)`
    );

    // 2. Clear existing rewards to avoid duplicates in mock data (Optional)
    // await prisma.userReward.deleteMany({ where: { userId } });

    const rewardsToCreate = [
      {
        title: 'Morning Sprinters Championship',
        type: RewardType.GOLD,
        description:
          'First place finish in the weekly Morning Sprinters challenge!',
      },
      {
        title: 'City Runners Loop',
        type: RewardType.SILVER,
        description: 'Second place finish in the downtown loop leaderboard.',
      },
      {
        title: 'Strive OG Club',
        type: RewardType.CLUB_MILESTONE,
        description: 'Earned when the Strive OG Club collectively hit 1,000km!',
        milestone: 1000,
      },
      {
        title: 'Iron Runner',
        type: RewardType.CLUB_MILESTONE, // Special badge reused type
        description:
          '30-day running consistency — 4 consecutive weeks of running!',
      },
    ];

    for (const data of rewardsToCreate) {
      // Check if user already has this badge (by title)
      const existing = await prisma.userReward.findFirst({
        where: {
          userId,
          reward: { title: data.title },
        },
      });

      if (!existing) {
        const reward = await prisma.reward.create({
          data: {
            title: data.title,
            type: data.type,
            description: data.description,
            milestone: data.milestone,
          },
        });

        await prisma.userReward.create({
          data: {
            userId,
            rewardId: reward.id,
            earnedAt: new Date(),
          },
        });
        console.log(`🏆 Awarded: ${data.title}`);
      } else {
        console.log(`⏩ Already have: ${data.title}`);
      }
    }

    // 3. Add a notification
    await prisma.notification.create({
      data: {
        userId,
        message: '🎉 Your mock rewards and Elite status have been unlocked!',
        type: 'reward',
      },
    });

    console.log(
      `\n✅ Successfully seeded rewards for ${user.fullname || user.username}`
    );
  } catch (error) {
    console.error('❌ Error seeding rewards:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
