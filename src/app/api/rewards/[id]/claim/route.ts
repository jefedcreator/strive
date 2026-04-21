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
import { Prisma, type UserReward } from '@prisma/client';
import { NextResponse } from 'next/server';

/**
 * @pathParams clubRewardParamValidator
 * @description Claim a club milestone reward for the authenticated user.
 * @auth bearer
 */
export const POST = withMiddleware<ClubRewardParamValidator>(
  async (request, { params }) => {
    try {
      const { id = "" } = params;
      const user = request.user!;

      // 1. Verify the reward exists
      const reward = await db.reward.findUnique({
        where: { id },
        include: {
          club: {
            select: {
              id: true,
              isPublic: true,
              createdById: true,
              name: true,
            },
          },
        },
      });

      if (!reward || !reward.clubId || !reward.club) {
        throw new NotFoundException('Reward not found');
      }

      if (reward.type !== 'CLUB_MILESTONE') {
        throw new ForbiddenException('Only club milestones can be claimed');
      }

      // 2. Verify or handle club membership
      const membership = await db.userClub.findUnique({
        where: {
          userId_clubId: {
            userId: user.id,
            clubId: reward.clubId,
          },
        },
      });

      if (!membership || !membership.isActive) {
        // If not a member, check if club is public to allow automatic join
        if (reward.clubId && reward.club.isPublic) {
          await db.$transaction([
            db.userClub.create({
              data: {
                userId: user.id,
                clubId: reward.clubId,
                role: 'MEMBER',
                isActive: true,
              },
            }),
            db.notification.create({
              data: {
                userId: reward.club.createdById,
                message: `${user.fullname} joined your club ${reward.club.name} to claim a reward`,
                type: 'info',
              },
            }),
            db.club.update({
              where: { id: reward.clubId },
              data: { memberCount: { increment: 1 } },
            }),
          ]);
        } else {
          throw new ForbiddenException(
            'You must be an active member of the club to claim this reward'
          );
        }
      }

      // 3. Upsert the UserReward
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
