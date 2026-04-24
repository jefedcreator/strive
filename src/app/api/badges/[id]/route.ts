import {
  optionalAuthMiddleware,
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
      const user = request.user;
      const { id = "" } = params;

      const reward = await db.reward.findUnique({
        where: { id },
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

      if (!reward || !reward.club || !reward.clubId) {
        throw new NotFoundException('Reward not found');
      }

      let isClaimed = false
      let isMember = false

      if (user?.id) {
        console.log(`Checking membership for user: ${user.id} in club: ${reward.clubId}`);
        const [claimedReward, membership] = await Promise.all([
          db.userReward.findUnique({
            where: { userId_rewardId: { userId: user.id, rewardId: id } },
          }),
          db.userClub.findUnique({
            where: { userId_clubId: { userId: user.id, clubId: reward.clubId } },
          })
        ])

        console.log(`Membership found: ${!!membership}, Claimed: ${!!claimedReward}`);
        isClaimed = !!claimedReward
        isMember = !!membership
      } else {
        console.log('No user identified in badge API request');
      }

      const response: ApiResponse<ClubRewardDetail> = {
        status: 200,
        message: 'Badge retrieved successfully',
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
          isClaimed, isMember
        },
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while fetching badge: ${error.message}`
      );
    }
  },
  [optionalAuthMiddleware, pathParamValidatorMiddleware(clubRewardParamValidator)]
);
