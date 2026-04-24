import {
  authMiddleware,
  pathParamValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import { paramValidator } from '@/backend/validators/index.validator';
import { db } from '@/server/db';
import { type ApiResponse } from '@/types';
import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/utils/exceptions';
import { type Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { recalculateLeaderboardPositions } from '@/backend/services/leaderboards';

const inviteParamValidator = paramValidator.extend({
  inviteId: z.string().min(1),
});

/**
 * @pathParams inviteParamValidator
 * @description Join a club using an invite ID. Works for both user-specific and open invites.
 * @auth bearer
 */
export const POST = withMiddleware<unknown>(
  async (request, { params }) => {
    try {
      const currentUser = request.user!;
      const { id: leaderboardId = '', inviteId = '' } = params as {
        id: string;
        inviteId: string;
      };

      const leaderboard = await db.leaderboard.findUnique({
        where: { id: leaderboardId },
        select: { id: true, name: true, createdById: true, clubId: true },
      });

      if (!leaderboard) {
        throw new NotFoundException('Leaderboard not found');
      }

      // Check if user is already a member
      const existingMembership = await db.userLeaderboard.findUnique({
        where: {
          userId_leaderboardId: {
            userId: currentUser.id,
            leaderboardId,
          },
        },
      });

      if (existingMembership) {
        throw new ConflictException(
          'You are already a member of this leaderboard'
        );
      }

      const invite = await db.leaderboardInvites.findUnique({
        where: { id: inviteId },
      });

      if (!invite) {
        throw new NotFoundException('Invite not found');
      }

      if (invite.leaderboardId !== leaderboardId) {
        throw new ForbiddenException(
          'Invite does not belong to this leaderboard'
        );
      }

      // If invite is specific to a user, ensure current user matches
      if (invite.userId && invite.userId !== currentUser.id) {
        throw new ForbiddenException('This invite was sent to another user');
      }

      // Join the leaderboard (and auto-join its club if applicable)
      const transactionOps: Prisma.PrismaPromise<unknown>[] = [
        db.userLeaderboard.create({
          data: {
            userId: currentUser.id,
            leaderboardId,
            isActive: true,
          },
        }),
        db.leaderboardInvites.delete({
          where: { id: inviteId },
        }),
        db.notification.create({
          data: {
            userId: leaderboard.createdById,
            message: `${currentUser.fullname} joined your leaderboard ${leaderboard.name} via invite`,
            type: 'info',
            leaderboardId,
          },
        }),
      ];

      // If the leaderboard belongs to a club, also add the user to that club
      if (leaderboard.clubId) {
        const existingClubMembership = await db.userClub.findUnique({
          where: {
            userId_clubId: {
              userId: currentUser.id,
              clubId: leaderboard.clubId,
            },
          },
        });

        if (!existingClubMembership) {
          transactionOps.push(
            db.userClub.create({
              data: {
                userId: currentUser.id,
                clubId: leaderboard.clubId,
                role: 'MEMBER',
                isActive: true,
              },
            })
          );
        }
      }

      await db.$transaction(transactionOps);
      await recalculateLeaderboardPositions(leaderboardId);

      const response: ApiResponse<null> = {
        status: 200,
        message: 'Successfully joined the leaderboard',
        data: null,
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while joining leaderboard via invite: ${error.message}`
      );
    }
  },
  [authMiddleware, pathParamValidatorMiddleware(inviteParamValidator)]
);
