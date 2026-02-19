import {
  pathParamValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import { paramValidator } from '@/backend/validators/index.validator';
import { db } from '@/server/db';
import { type ApiResponse, type LeaderboardInviteDetail } from '@/types';
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
      const { id: leaderboardId = '', inviteId = '' } = params as {
        id: string;
        inviteId: string;
      };

      const invite = await db.leaderboardInvites.findUnique({
        where: { id: inviteId },
        include: {
          leaderboard: {
            select: {
              id: true,
              name: true,
              description: true,
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

      if (invite.leaderboardId !==  leaderboardId) {
        throw new ForbiddenException('Invite does not belong to this leaderboard');
      }

      // If invite is specific to a user, ensure current user matches
      if (invite.userId && invite.userId !== request.user?.id) {
        throw new ForbiddenException('This invite was sent to another user');
      }

      const response: ApiResponse<LeaderboardInviteDetail> = {
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
