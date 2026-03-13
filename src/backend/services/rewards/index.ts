import { db } from '@/server/db';
import { type RewardType } from '@prisma/client';

const CLUB_MILESTONES = [500, 1000, 2500, 5000, 10000]; // km

/**
 * Award rewards to top 3 finishers of an expired leaderboard.
 * Idempotent — skips if rewards already exist for this leaderboard.
 */
export async function awardLeaderboardRewards(leaderboardId: string) {
  // Check if rewards already awarded for this leaderboard
  const existingRewards = await db.reward.findFirst({
    where: { leaderboardId },
  });

  if (existingRewards) return; // Already processed

  const leaderboard = await db.leaderboard.findUnique({
    where: { id: leaderboardId },
    include: {
      entries: {
        where: { isActive: true },
        orderBy: { score: 'desc' },
        take: 3,
        include: {
          user: { select: { id: true, fullname: true } },
        },
      },
    },
  });

  if (!leaderboard) return;

  // Only award if leaderboard is expired
  if (
    !leaderboard.expiryDate ||
    new Date(leaderboard.expiryDate) > new Date()
  ) {
    return;
  }

  // Only award if there are entries with scores > 0
  const qualifiedEntries = leaderboard.entries.filter((e) => e.score > 0);
  if (qualifiedEntries.length === 0) return;

  const isChallenge = !leaderboard.clubId;
  const typeLabel = isChallenge ? 'Challenge' : 'Leaderboard';
  const rewardTypes: RewardType[] = ['GOLD', 'SILVER', 'BRONZE'];

  for (let i = 0; i < Math.min(qualifiedEntries.length, 3); i++) {
    const entry = qualifiedEntries[i]!;
    const type = rewardTypes[i]!;
    const placeLabel = i === 0 ? '1st' : i === 1 ? '2nd' : '3rd';

    // Create the reward
    const reward = await db.reward.create({
      data: {
        type,
        title: `${placeLabel} Place — ${leaderboard.name}`,
        description: `Earned ${placeLabel} place in the ${typeLabel} "${leaderboard.name}"`,
        leaderboardId: leaderboard.id,
        clubId: leaderboard.clubId,
      },
    });

    // Assign to the user
    await db.userReward.create({
      data: {
        userId: entry.userId,
        rewardId: reward.id,
      },
    });

    // Send notification
    await db.notification.create({
      data: {
        userId: entry.userId,
        message: `🏆 You earned ${placeLabel} place in "${leaderboard.name}"! View your reward.`,
        type: 'reward',
        leaderboardId: leaderboard.id,
      },
    });
  }
}

/**
 * Check and award club milestone rewards based on cumulative distance.
 * Idempotent — only awards milestones that haven't been awarded yet.
 */
export async function checkClubMilestones(clubId: string) {
  const club = await db.club.findUnique({
    where: { id: clubId },
    select: {
      id: true,
      name: true,
      members: {
        where: { isActive: true },
        select: { userId: true },
      },
    },
  });

  if (!club || club.members.length === 0) return;

  const memberIds = club.members.map((m) => m.userId);

  // Sum total distance across all members' leaderboard entries (for leaderboards of this club)
  const result = await db.userLeaderboard.aggregate({
    where: {
      userId: { in: memberIds },
      leaderboard: { clubId },
      isActive: true,
    },
    _sum: { runDistance: true },
  });

  const totalDistanceKm = result._sum.runDistance ?? 0;

  // Check which milestones are already awarded
  const existingMilestones = await db.reward.findMany({
    where: {
      clubId,
      type: 'CLUB_MILESTONE',
    },
    select: { milestone: true },
  });

  const awardedMilestones = new Set(
    existingMilestones.map((r) => r.milestone).filter(Boolean)
  );

  // Award new milestones
  for (const milestone of CLUB_MILESTONES) {
    if (totalDistanceKm >= milestone && !awardedMilestones.has(milestone)) {
      const reward = await db.reward.create({
        data: {
          type: 'CLUB_MILESTONE',
          title: `${milestone}km Club Milestone`,
          description: `${club.name} collectively ran ${milestone}km!`,
          clubId: club.id,
          milestone,
        },
      });

      // Award to all current active members
      for (const userId of memberIds) {
        await db.userReward.upsert({
          where: {
            userId_rewardId: { userId, rewardId: reward.id },
          },
          create: { userId, rewardId: reward.id },
          update: {},
        });
      }

      // Notify all members
      await db.notification.createMany({
        data: memberIds.map((userId) => ({
          userId,
          message: `🛡️ ${club.name} hit the ${milestone}km milestone! You earned a reward.`,
          type: 'reward' as const,
          clubId: club.id,
        })),
      });
    }
  }
}

/**
 * Award "Iron Runner" badge when a user reaches a 4-week running streak.
 * Idempotent — checks by reward title.
 */
export async function checkStreakRewards(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, currentStreak: true, fullname: true },
  });

  if (!user || user.currentStreak < 4) return;

  // Check if already awarded
  const existing = await db.reward.findFirst({
    where: {
      title: 'Iron Runner',
      userRewards: { some: { userId } },
    },
  });

  if (existing) return;

  const reward = await db.reward.create({
    data: {
      type: 'CLUB_MILESTONE',
      title: 'Iron Runner',
      description:
        '30-day running consistency — 4 consecutive weeks of running!',
    },
  });

  await db.userReward.create({
    data: { userId, rewardId: reward.id },
  });

  await db.notification.create({
    data: {
      userId,
      message:
        '🏅 You earned the Iron Runner badge! 4 weeks of consistent running.',
      type: 'reward',
    },
  });
}
