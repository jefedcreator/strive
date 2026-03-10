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
import { Resend } from 'resend';
import InviteEmail from '@/components/emails/invite-email';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

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
      const { userId: userToInviteId, isExternal } =
        request.validatedData!;

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
        if (isExternal) {
          // Handle external email invite
          const invite = await db.clubInvites.create({
            data: {
              clubId,
              invitedBy: currentUser.id,
              isRequest: true,
              // store the email somewhere if possible, here we rely on the email variable for Resend
            },
          });

          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL || 'https://usestrive.run';
          const inviteLink = `${appUrl}/clubs/${clubId}/invites/${invite.id}`;

          try {
            await resend.emails.send({
              from: 'Strive <invites@usestrive.run>',
              to: userToInviteId, // It's an email in this case
              subject: `You've been invited to join ${club.name} on Strive`,
              react: InviteEmail({
                invitedByUsername: currentUser.fullname,
                invitedByEmail: currentUser.email,
                entityName: club.name,
                entityType: 'club',
                inviteLink: inviteLink,
                invitedUserAvatar: currentUser.avatar || club.image,
              }),
            });
          } catch (emailError) {
            console.error('Failed to send invite email:', emailError);
          }

          const response: ApiResponse<{ id: string }> = {
            status: 201,
            message: 'External email invite sent successfully',
            data: { id: invite.id },
          };

          return NextResponse.json(response, { status: 201 });
        }

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

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usestrive.run';
        const inviteLink = `${appUrl}/clubs/${clubId}/invites/${invite[0].id}`;

        try {
          await resend.emails.send({
            from: 'Strive <invites@usestrive.run>',
            to: userToInvite.email,
            subject: `You've been invited to join ${club.name} on Strive`,
            react: InviteEmail({
              invitedByUsername: currentUser.fullname,
              invitedByEmail: currentUser.email,
              entityName: club.name,
              entityType: 'club',
              inviteLink: inviteLink,
              invitedUserAvatar: currentUser.avatar || club.image,
            }),
          });
        } catch (emailError) {
          console.error('Failed to send invite email:', emailError);
        }

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
