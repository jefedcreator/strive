import {
  authMiddleware,
  pathParamValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import { paramValidator } from '@/backend/validators/index.validator';
import { db } from '@/server/db';
import { type ApiResponse } from '@/types';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@/utils/exceptions';
import { NextResponse } from 'next/server';

/**
 * @description Get rewards earned by a specific club.
 */
export const GET = withMiddleware<unknown>(
  async (request, { params }) => {
    try {
      const { id } = params;

      const club = await db.club.findUnique({
        where: { id },
        select: { id: true, name: true },
      });

      if (!club) {
        throw new NotFoundException('Club not found');
      }

      const rewards = await db.reward.findMany({
        where: { clubId: id },
        include: {
          _count: { select: { userRewards: true } },
        },
        orderBy: { createdAt: 'desc' },
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

      const response: ApiResponse<typeof mapped> = {
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
  [authMiddleware, pathParamValidatorMiddleware(paramValidator)]
);
