import {
  pathParamValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import { paramValidator } from '@/backend/validators/index.validator';
import { db } from '@/server/db';
import { type ApiResponse, type UserRewardDetail } from '@/types';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@/utils/exceptions';
import { NextResponse } from 'next/server';

/**
 * @pathParams paramValidator
 * @description Get a user reward by ID. 
 */
export const GET = withMiddleware<unknown>(
  async (request, { params }) => {
    try {
      const { id } = params;

      const data = await db.userReward.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              fullname: true,
              username: true,
              avatar: true,
            },
          },
          reward: {
            include: {
              leaderboard: { select: { name: true } },
              club: { select: { name: true } },
            },
          },
        },
      });

      if (!data) {
        throw new NotFoundException('Reward not found');
      }

      const response: ApiResponse<UserRewardDetail> = {
        status: 200,
        message: 'Reward retrieved successfully',
        data,
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while fetching reward: ${error.message}`
      );
    }
  },
  [pathParamValidatorMiddleware(paramValidator)]
);
