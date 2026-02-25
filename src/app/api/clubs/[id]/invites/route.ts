import {
  authMiddleware,
  bodyValidatorMiddleware,
  pathParamValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import {
  clubInviteValidatorSchema,
  type ClubInviteValidatorSchema,
} from '@/backend/validators/club.validator';
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

/**
 * @pathParams paramValidator
 * @body ClubInviteValidatorSchema
 * @description Invite a user to a club. Only the owner can do this.
 * @auth bearer
 */
export const POST = withMiddleware<ClubInviteValidatorSchema>(
  async (request, { params }) => {
    try {
      const currentUser = request.user!;
      const { id: clubId = '' } = params;
      const { userId: userToInviteId } = request.validatedData!;

      console.log('userToInviteId', userToInviteId);

      const club = await db.club.findUnique({
        where: { id: clubId },
      });

      if (!club) {
        throw new NotFoundException('Club not found');
      }

      const requesterMembership = await db.userClub.findFirst({
        where: {
          userId: currentUser.id,
          clubId,
        },
      });

      if (!requesterMembership || !requesterMembership.isActive) {
        throw new ForbiddenException('Only club members can invite users');
      }

      if (userToInviteId) {
        const userToInvite = await db.user.findUnique({
          where: { id: userToInviteId },
        });

        if (!userToInvite) {
          throw new NotFoundException('User to invite not found');
        }

        const existingMembership = await db.userClub.findUnique({
          where: {
            userId_clubId: {
              userId: userToInviteId,
              clubId,
            },
          },
        });

        if (existingMembership) {
          throw new ConflictException('User is already a member of this club');
        }

        const existingInvite = await db.clubInvites.findFirst({
          where: {
            userId: userToInviteId,
            clubId,
          },
        });

        if (existingInvite) {
          throw new ConflictException(
            'An invite or join request already exists for this user'
          );
        }

        // Create invite and notification in a transaction
        const invite = await db.$transaction([
          db.clubInvites.create({
            data: {
              userId: userToInviteId,
              clubId,
              invitedBy: currentUser.id,
              isRequest: true,
            },
          }),
          db.notification.create({
            data: {
              userId: userToInviteId,
              message: `Request sent to ${userToInvite.fullname} to join your club ${club.name}`,
              type: 'club',
              clubId: clubId,
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

      const invite = await db.clubInvites.create({
        data: {
          clubId,
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
