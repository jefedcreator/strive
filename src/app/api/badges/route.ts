import { authMiddleware, withMiddleware } from '@/backend/middleware';
import type { AuthRequest } from '@/backend/middleware/types';
import { db } from '@/server/db';
import { type ApiResponse, type ClubRewardItem } from '@/types';
import { InternalServerErrorException } from '@/utils/exceptions';
import { NextResponse } from 'next/server';

/**
 * @description Get club milestone badges for every club the authenticated user belongs to.
 */
export const GET = withMiddleware<unknown>(
  async (request: AuthRequest) => {
    try {
      const user = request.user!;

      const memberships = await db.userClub.findMany({
        where: {
          userId: user.id,
          isActive: true,
        },
        select: { clubId: true },
      });

      const clubIds = memberships.map((membership) => membership.clubId);

      if (clubIds.length === 0) {
        const response: ApiResponse<ClubRewardItem[]> = {
          status: 200,
          message: 'Club rewards retrieved successfully',
          data: [],
        };

        return NextResponse.json(response);
      }

      const rewards = await db.reward.findMany({
        where: {
          clubId: { in: clubIds },
          type: 'CLUB_MILESTONE',
        },
        include: {
          _count: { select: { userRewards: true } },
        },
        orderBy: [{ createdAt: 'desc' }, { milestone: 'asc' }],
      });

      const mapped = rewards.map((r) => {
        const badgeType = r.type === 'CLUB_MILESTONE' ? 'club' : 'gold';
        const badgeParams = new URLSearchParams({
          type: badgeType,
          title: r.title,
          ...(r.description ? { subtitle: r.description } : {}),
          ...(r.milestone ? { milestone: String(r.milestone) } : {}),
        });

        return {
          id: r.id,
          type: r.type,
          title: r.title,
          description: r.description,
          milestone: r.milestone,
          createdAt: r.createdAt,
          earnedBy: r._count.userRewards,
          badgeUrl: `/api/rewards/badge?${badgeParams.toString()}`,
        };
      });

      const response: ApiResponse<ClubRewardItem[]> = {
        status: 200,
        message: 'Club rewards retrieved successfully',
        data: mapped,
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while fetching club rewards: ${error.message}`
      );
    }
  },
  [authMiddleware]
);
