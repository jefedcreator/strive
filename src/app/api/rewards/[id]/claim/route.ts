import {
  authMiddleware,
  pathParamValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import {
  clubRewardParamValidator,
  type ClubRewardParamValidator,
} from '@/backend/validators/rewards.validator';
import { db } from '@/server/db';
import { type ApiResponse } from '@/types';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/utils/exceptions';
import { type UserReward } from '@prisma/client';
import { NextResponse } from 'next/server';

/**
 * @pathParams clubRewardParamValidator
 * @description Claim a club milestone reward for the authenticated user.
 * @auth bearer
 */
export const POST = withMiddleware<ClubRewardParamValidator>(
  async (request, { params }) => {
    try {
      const { id } = params;
      const user = request.user!;

      // 1. Verify the reward exists and belongs to the club
      const reward = await db.reward.findUnique({
        where: { id },
        select: {
          clubId: true,
          type: true,
        }
      });

      if (!reward || reward.clubId !== id) {
        throw new NotFoundException('Reward not found');
      }

      if (reward.type !== 'CLUB_MILESTONE') {
        throw new ForbiddenException('Only club milestones can be claimed');
      }

      // 2. Verify the user is an active member of the club
      const membership = await db.userClub.findUnique({
        where: {
          userId_clubId: { userId: user.id, clubId: reward.clubId },
        },
      });

      if (!membership || !membership.isActive) {
        throw new ForbiddenException('You must be an active member of the club to claim this reward');
      }

      // 3. Upsert the UserReward (as requested, based on the service snippet)
      const userReward = await db.userReward.upsert({
        where: {
          userId_rewardId: { userId: user.id, rewardId: id },
        },
        create: { userId: user.id, rewardId: id },
        update: {}, // No-op if it already exists
      });

      const response: ApiResponse<UserReward> = {
        status: 200,
        message: 'Reward claimed successfully',
        data: userReward,
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while claiming reward: ${error.message}`
      );
    }
  },
  [authMiddleware, pathParamValidatorMiddleware(clubRewardParamValidator)]
);
