import {
  authMiddleware,
  pathParamValidatorMiddleware,
  bodyValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import {
  leaderboardInviteValidatorSchema,
  type LeaderboardInviteValidatorSchema,
} from '@/backend/validators/leaderboard.validator';
import { paramValidator } from '@/backend/validators/index.validator';
import { db } from '@/server/db';
import { type ApiResponse } from '@/types';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/utils/exceptions';
import { NextResponse } from 'next/server';

/**
 * @pathParams paramValidator
 * @body LeaderboardInviteValidatorSchema
 * @description Invite a user to a leaderboard. Only members can do this.
 * @auth bearer
 */
export const POST = withMiddleware<LeaderboardInviteValidatorSchema>(
  async (request, { params }) => {
    try {
      const currentUser = request.user!;
      const { id: leaderboardId = '' } = params;
      const { userId: userToInviteId } = request.validatedData!;

      const leaderboard = await db.leaderboard.findUnique({
        where: { id: leaderboardId },
      });

      if (!leaderboard) {
        throw new NotFoundException('Leaderboard not found');
      }

      // Check if leaderboard is expired
      if (leaderboard.expiryDate && new Date() > leaderboard.expiryDate) {
        throw new BadRequestException(
          'Cannot invite users to an expired leaderboard'
        );
      }

      // Check if current user is a member of the leaderboard
      const requesterMembership = await db.userLeaderboard.findUnique({
        where: {
          userId_leaderboardId: {
            userId: currentUser.id,
            leaderboardId,
          },
        },
      });

      // Also allow the creator to invite even if not in userLeaderboard (though typically they are)
      if (!requesterMembership && leaderboard.createdById !== currentUser.id) {
        throw new ForbiddenException(
          'Only leaderboard members can invite users'
        );
      }

      // Check if user to invite exists
      const userToInvite = await db.user.findUnique({
        where: { id: userToInviteId },
      });

      if (!userToInvite) {
        throw new NotFoundException('User to invite not found');
      }

      // Check if user is already a member
      const existingMembership = await db.userLeaderboard.findUnique({
        where: {
          userId_leaderboardId: {
            userId: userToInviteId,
            leaderboardId,
          },
        },
      });

      if (existingMembership) {
        throw new ConflictException(
          'User is already a member of this leaderboard'
        );
      }

      // Check if an invite/request already exists
      const existingInvite = await db.leaderboardInvites.findFirst({
        where: {
          userId: userToInviteId,
          leaderboardId,
        },
      });

      if (existingInvite) {
        throw new ConflictException(
          'An invite or join request already exists for this user'
        );
      }

      // Create invite
      await db.$transaction([
        db.leaderboardInvites.create({
          data: {
            userId: userToInviteId,
            leaderboardId,
            invitedBy: currentUser.id,
            isRequest: true,
          },
        }),
        db.notification.create({
          data: {
            userId: userToInviteId,
            message: `Request sent to ${userToInvite.fullname} to join the leaderboard ${leaderboard.name}`,
            type: 'leaderboard',
            leaderboardId,
          },
        }),
      ]);

      const response: ApiResponse<null> = {
        status: 201,
        message: 'User invited successfully',
        data: null,
      };

      return NextResponse.json(response, { status: 201 });
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while inviting user: ${error.message}`
      );
    }
  },
  [
    authMiddleware,
    pathParamValidatorMiddleware(paramValidator),
    bodyValidatorMiddleware(leaderboardInviteValidatorSchema),
  ]
);
