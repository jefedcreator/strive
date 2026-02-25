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
import { NextResponse } from 'next/server';
import { z } from 'zod';

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
      const { id: clubId = '', inviteId = '' } = params as {
        id: string;
        inviteId: string;
      };

      const club = await db.club.findUnique({
        where: { id: clubId },
      });

      if (!club) {
        throw new NotFoundException('Club not found');
      }

      // Check if user is already a member
      const existingMembership = await db.userClub.findUnique({
        where: {
          userId_clubId: {
            userId: currentUser.id,
            clubId,
          },
        },
      });

      if (existingMembership) {
        throw new ConflictException('You are already a member of this club');
      }

      const invite = await db.clubInvites.findUnique({
        where: { id: inviteId },
      });

      if (!invite) {
        throw new NotFoundException('Invite not found');
      }

      if (invite.clubId !== clubId) {
        throw new ForbiddenException('Invite does not belong to this club');
      }

      // If invite is specific to a user, ensure current user matches
      if (invite.userId && invite.userId !== currentUser.id) {
        throw new ForbiddenException('This invite was sent to another user');
      }

      // Join the club
      await db.$transaction([
        db.userClub.create({
          data: {
            userId: currentUser.id,
            clubId,
            role: 'MEMBER',
            isActive: true,
          },
        }),
        db.club.update({
          where: { id: clubId },
          data: { memberCount: { increment: 1 } },
        }),
        db.clubInvites.delete({
          where: { id: inviteId },
        }),
        db.notification.create({
          data: {
            userId: club.createdById,
            message: `${currentUser.fullname} joined your club ${club.name} via invite`,
            type: 'info',
            clubId,
          },
        }),
      ]);

      const response: ApiResponse<null> = {
        status: 200,
        message: 'Successfully joined the club',
        data: null,
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while joining club via invite: ${error.message}`
      );
    }
  },
  [authMiddleware, pathParamValidatorMiddleware(inviteParamValidator)]
);
