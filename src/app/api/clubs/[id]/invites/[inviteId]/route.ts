import {
  pathParamValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import { paramValidator } from '@/backend/validators/index.validator';
import { db } from '@/server/db';
import { type ApiResponse, type ClubInviteDetail } from '@/types';
import { mongoIdValidator } from '@/utils';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/utils/exceptions';
import { NextResponse } from 'next/server';

const inviteParamValidator = paramValidator.extend({
  inviteId: mongoIdValidator,
});

/**
 * @pathParams inviteParamValidator
 * @description Get an invite by ID.
 */
export const GET = withMiddleware<unknown>(
  async (request, { params }) => {
    try {
      const { id: clubId = '', inviteId = '' } = params as {
        id: string;
        inviteId: string;
      };

      const invite = await db.clubInvites.findUnique({
        where: { id: inviteId },
        include: {
          club: {
            select: {
              id: true,
              name: true,
              image: true,
              description: true,
              memberCount: true,
            },
          },
          inviter: {
            select: {
              id: true,
              fullname: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      if (!invite) {
        throw new NotFoundException('Invite not found');
      }

      if (invite.clubId !== clubId) {
        throw new ForbiddenException('Invite does not belong to this club');
      }

      // If invite is specific to a user, ensure current user matches
      if (invite.userId && invite.userId !== request.user?.id) {
        throw new ForbiddenException('This invite was sent to another user');
      }

      const response: ApiResponse<ClubInviteDetail> = {
        status: 200,
        message: 'Invite retrieved successfully',
        data: invite,
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while fetching invite: ${error.message}`
      );
    }
  },
  [pathParamValidatorMiddleware(inviteParamValidator)]
);
