import { authMiddleware, withMiddleware } from '@/backend/middleware';
import type { AuthRequest } from '@/backend/middleware/types';
import { db } from '@/server/db';
import { type PaginatedApiResponse, type RewardsData } from '@/types';
import { InternalServerErrorException } from '@/utils/exceptions';
import { NextResponse } from 'next/server';
import { getTier, getNextTier } from '@/backend/services/xp';
import { rewardsQueryValidatorSchema } from '@/backend/validators/rewards.validator';

/**
 * @description Get the authenticated user's rewards with badge URLs.
 */
export const GET = withMiddleware(
  async (request: AuthRequest) => {
    try {
      const user = request.user!;
      const payload = request.query!;

      const page = payload.page ?? 1;
      const size = payload.size ?? 10;
      const skip = (page - 1) * size;

      const [userRewards, total] = await Promise.all([
        db.userReward.findMany({
          where: { userId: user.id },
          include: {
            reward: {
              include: {
                leaderboard: { select: { id: true, name: true, clubId: true } },
                club: { select: { id: true, name: true, slug: true } },
              },
            },
          },
          orderBy: { earnedAt: 'desc' },
          skip,
          take: size,
        }),
        db.userReward.count({ where: { userId: user.id } }),
      ]);

      const rewards = userRewards.map((ur) => {
        const r = ur.reward;
        const badgeType =
          r.type === 'GOLD'
            ? 'gold'
            : r.type === 'SILVER'
              ? 'silver'
              : r.type === 'BRONZE'
                ? 'bronze'
                : 'club';

        const badgeParams = new URLSearchParams({
          type: badgeType,
          title: r.title,
          ...(r.description ? { subtitle: r.description } : {}),
          ...(r.milestone ? { milestone: String(r.milestone) } : {}),
        });

        return {
          id: ur.id,
          rewardId: r.id,
          type: r.type,
          title: r.title,
          description: r.description,
          earnedAt: ur.earnedAt,
          leaderboard: r.leaderboard,
          club: r.club,
          milestone: r.milestone,
          badgeUrl: `/api/rewards/badge?${badgeParams.toString()}`,
        };
      });

      const currentTier = getTier(user.xp ?? 0);
      const nextTier = getNextTier(user.xp ?? 0);

      const response: PaginatedApiResponse<RewardsData> = {
        status: 200,
        message: 'Rewards retrieved successfully',
        data: {
          data: rewards,
          xp: user.xp ?? 0,
          currentStreak: user.currentStreak ?? 0,
          longestStreak: user.longestStreak ?? 0,
          tier: currentTier,
          nextTier,
          tierBadgeUrl: `/api/rewards/tier-badge?tier=${currentTier.name.toLowerCase()}&username=${encodeURIComponent(user.fullname ?? 'Runner')}&xp=${user.xp ?? 0}`,
        },
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while fetching rewards: ${error.message}`
      );
    }
  },
  [authMiddleware]
);
