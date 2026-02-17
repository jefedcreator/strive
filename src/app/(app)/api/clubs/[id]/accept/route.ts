import {
  authMiddleware,
  pathParamValidatorMiddleware,
  bodyValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import {
  acceptInviteValidatorSchema,
  type AcceptInviteValidatorSchema,
} from '@/backend/validators/club.validator';
import { paramValidator } from '@/backend/validators/index.validator';
import { db } from '@/server/db';
import { type ApiResponse } from '@/types';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/utils/exceptions';
import { NextResponse } from 'next/server';

/**
 * @pathParams paramValidator
 * @body AcceptInviteValidatorSchema
 * @description Accept a join request (invite) for a club. Only the owner can do this.
 * @auth bearer
 */
export const POST = withMiddleware<AcceptInviteValidatorSchema>(
  async (request, { params }) => {
    try {
      const currentUser = request.user!;
      const { id: clubId } = params;
      const { userId: userToAcceptId } = request.validatedData!;

      const club = await db.club.findUnique({
        where: { id: clubId },
      });

      if (!club) {
        throw new NotFoundException('Club not found');
      }

      // Check if current user is the owner
      if (club.createdById !== currentUser.id) {
        throw new ForbiddenException(
          'Only the club owner can accept join requests'
        );
      }

      // Check if the invite/request exists
      const invite = await db.clubInvites.findFirst({
        where: {
          userId: userToAcceptId,
          clubId,
        },
      });

      if (!invite) {
        throw new NotFoundException('Join request not found');
      }

      // Add user to club and remove invite
      await db.$transaction([
        db.userClub.create({
          data: {
            userId: userToAcceptId,
            clubId: clubId!,
            role: 'MEMBER',
          },
        }),
        db.clubInvites.delete({
          where: { id: invite.id },
        }),
        db.club.update({
          where: { id: clubId },
          data: { memberCount: { increment: 1 } },
        }),
        db.notification.create({
          data: {
            userId: userToAcceptId,
            message: `Your request to join the club "${club.name}" has been accepted!`,
            type: 'info',
            referenceId: club.id,
          },
        }),
      ]);

      const response: ApiResponse<null> = {
        status: 200,
        message: 'User successfully added to the club',
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
    bodyValidatorMiddleware(acceptInviteValidatorSchema),
  ]
);
