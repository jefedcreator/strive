import { db } from '@/server/db';
import { sendClubMilestoneEmail } from '../email';

const CLUB_MILESTONES = [10, 20, 50, 100, 200, 250, 500, 1000, 2500, 5000, 10000]; // km

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

  // Retrieve the actual user emails for the members
  const membersWithEmails = await db.user.findMany({
    where: {
      id: { in: memberIds },
    },
    select: {
      id: true,
      email: true,
    },
  });

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
      for (const member of membersWithEmails) {
        const userReward = await db.userReward.upsert({
          where: {
            userId_rewardId: { userId: member.id, rewardId: reward.id },
          },
          create: { userId: member.id, rewardId: reward.id },
          update: {},
        });

        // Build URLs for the email
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://usestrive.run';
        const rewardUrl = `${baseUrl}/rewards/${userReward.id}`;
        
        const badgeParams = new URLSearchParams({
          type: 'club',
          title: reward.title,
          ...(reward.description ? { subtitle: reward.description } : {}),
          ...(reward.milestone ? { milestone: String(reward.milestone) } : {}),
        });
        const badgeUrl = `${baseUrl}/api/rewards/badge?${badgeParams.toString()}`;

        // Send Email
        if (member.email) {
          await sendClubMilestoneEmail(
            member.email, 
            club.name, 
            milestone,
            badgeUrl,
            rewardUrl
          );
        }
      }

      // Notify all members
      await db.notification.createMany({
        data: memberIds.map((userId) => ({
          userId,
          message: `🔥 ${club.name} hit the ${milestone}km milestone! You earned a reward.`,
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
