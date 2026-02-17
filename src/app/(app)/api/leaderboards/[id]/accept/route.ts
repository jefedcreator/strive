import {
  authMiddleware,
  pathParamValidatorMiddleware,
  bodyValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import {
  acceptLeaderboardInviteValidatorSchema,
  type AcceptLeaderboardInviteValidatorSchema,
} from '@/backend/validators/leaderboard.validator';
import { paramValidator } from '@/backend/validators/index.validator';
import { db } from '@/server/db';
import { type ApiResponse } from '@/types';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/utils/exceptions';
import { NextResponse } from 'next/server';

/**
 * @pathParams paramValidator
 * @body AcceptLeaderboardInviteValidatorSchema
 * @description Accept a join request (invite) for a leaderboard. Only the creator can do this.
 * @auth bearer
 */
export const POST = withMiddleware<AcceptLeaderboardInviteValidatorSchema>(
  async (request, { params }) => {
    try {
      const currentUser = request.user!;
      const { id: leaderboardId = '' } = params;
      const { userId: userToAcceptId } = request.validatedData!;

      const leaderboard = await db.leaderboard.findUnique({
        where: { id: leaderboardId },
      });

      if (!leaderboard) {
        throw new NotFoundException('Leaderboard not found');
      }

      // Check if current user is the creator
      if (leaderboard.createdById !== currentUser.id) {
        throw new ForbiddenException(
          'Only the leaderboard creator can accept join requests'
        );
      }

      // Check if leaderboard is expired
      if (leaderboard.expiryDate && new Date() > leaderboard.expiryDate) {
        throw new BadRequestException(
          'Cannot add users to an expired leaderboard'
        );
      }

      // Check if the invite/request exists
      const invite = await db.leaderboardInvites.findFirst({
        where: {
          userId: userToAcceptId,
          leaderboardId,
        },
      });

      if (!invite) {
        throw new NotFoundException('Join request not found');
      }

      // Add user to leaderboard and remove invite
      await db.$transaction([
        db.userLeaderboard.create({
          data: {
            userId: userToAcceptId,
            leaderboardId,
          },
        }),
        db.leaderboardInvites.delete({
          where: { id: invite.id },
        }),
        db.notification.create({
          data: {
            userId: userToAcceptId,
            message: `Your request to join the leaderboard "${leaderboard.name}" has been accepted!`,
            type: 'info',
            referenceId: leaderboard.id,
          },
        }),
      ]);

      const response: ApiResponse<null> = {
        status: 200,
        message: 'User successfully added to the leaderboard',
        data: null,
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while accepting join request: ${error.message}`
      );
    }
  },
  [
    authMiddleware,
    pathParamValidatorMiddleware(paramValidator),
    bodyValidatorMiddleware(acceptLeaderboardInviteValidatorSchema),
  ]
);
