import {
  authMiddleware,
  bodyValidatorMiddleware,
  pathParamValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import { clubInviteValidatorSchema } from '@/backend/validators/club.validator';
import { paramValidator } from '@/backend/validators/index.validator';
import type { LeaderboardInviteValidatorSchema } from '@/backend/validators/leaderboard.validator';
import { db } from '@/server/db';
import { type ApiResponse } from '@/types';
import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/utils/exceptions';
import { NextResponse } from 'next/server';

/**
 * @pathParams paramValidator
 * @body LeaderboardInviteValidatorSchema
 * @description Invite a user to a leaderboard. Only the owner can do this.
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

      const requesterMembership = await db.userLeaderboard.findFirst({
        where: {
          userId: currentUser.id,
          leaderboardId,
        },
      });

      if (!requesterMembership || !requesterMembership.isActive) {
        throw new ForbiddenException(
          'Only leaderboard members can invite users'
        );
      }

      if (userToInviteId) {
        const userToInvite = await db.user.findUnique({
          where: { id: userToInviteId },
        });

        if (!userToInvite) {
          throw new NotFoundException('User to invite not found');
        }

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

        // Create invite and notification in a transaction
        const invite = await db.$transaction([
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
              message: `Request sent to ${userToInvite.fullname} to join your leaderboard ${leaderboard.name}`,
              type: 'leaderboard',
              leaderboardId,
            },
          }),
        ]);

        const response: ApiResponse<{ id: string }> = {
          status: 201,
          message: 'User invited successfully',
          data: { id: invite[0].id },
        };

        return NextResponse.json(response, { status: 201 });
      }

      const invite = await db.leaderboardInvites.create({
        data: {
          leaderboardId,
          invitedBy: currentUser.id,
          isRequest: true,
        },
      });

      const response: ApiResponse<{ id: string }> = {
        status: 201,
        message: 'Invite link generated successfully',
        data: { id: invite.id },
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
    bodyValidatorMiddleware(clubInviteValidatorSchema),
  ]
);
