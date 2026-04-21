import {
  pathParamValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import {
  clubRewardParamValidator,
  type ClubRewardParamValidator,
} from '@/backend/validators/rewards.validator';
import { db } from '@/server/db';
import { type ApiResponse, type ClubRewardDetail } from '@/types';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@/utils/exceptions';
import { NextResponse } from 'next/server';

/**
 * @pathParams clubRewardParamValidator
 * @description Get a club milestone reward by ID.
 */
export const GET = withMiddleware<ClubRewardParamValidator>(
  async (request, { params }) => {
    try {
      const { id, rewardId } = params;

      const reward = await db.reward.findUnique({
        where: { id: rewardId },
        include: {
          club: {
            select: {
              id: true,
              name: true,
              image: true,
              isPublic: true,
            },
          },
        },
      });

      if (!reward || !reward.club || reward.clubId !== id) {
        throw new NotFoundException('Reward not found');
      }

      const response: ApiResponse<ClubRewardDetail> = {
        status: 200,
        message: 'Reward retrieved successfully',
        data: {
          id: reward.id,
          type: reward.type,
          title: reward.title,
          description: reward.description,
          milestone: reward.milestone,
          createdAt: reward.createdAt,
          club: {
            id: reward.club.id,
            name: reward.club.name,
            image: reward.club.image,
            isPublic: reward.club.isPublic,
          },
        },
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while fetching reward: ${error.message}`
      );
    }
  },
  [pathParamValidatorMiddleware(clubRewardParamValidator)]
);
