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
import { Resend } from 'resend';
import InviteEmail from '@/components/emails/invite-email';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

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
      const { userId: userToInviteId, isExternal } =
        request.validatedData as any;

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
        if (isExternal) {
          // Handle external email invite
          const invite = await db.leaderboardInvites.create({
            data: {
              leaderboardId,
              invitedBy: currentUser.id,
              isRequest: true,
              // store the email somewhere if possible, here we rely on the email variable for Resend
            },
          });

          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL || 'https://usestrive.run';
          const inviteLink = `${appUrl}/leaderboards/${leaderboardId}/invites/${invite.id}`;

          try {
            await resend.emails.send({
              from: 'Strive <invites@usestrive.run>',
              to: userToInviteId, // It's an email in this case
              subject: `You've been invited to join ${leaderboard.name} on Strive`,
              react: InviteEmail({
                invitedByUsername: currentUser.fullname,
                invitedByEmail: currentUser.email,
                entityName: leaderboard.name,
                entityType: 'leaderboard',
                inviteLink: inviteLink,
                invitedUserAvatar: currentUser.avatar,
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

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usestrive.run';
        const inviteLink = `${appUrl}/leaderboards/${leaderboardId}/invites/${invite[0].id}`;

        try {
          await resend.emails.send({
            from: 'Strive <invites@usestrive.run>',
            to: userToInvite.email,
            subject: `You've been invited to join ${leaderboard.name} on Strive`,
            react: InviteEmail({
              invitedByUsername: currentUser.fullname,
              invitedByEmail: currentUser.email,
              entityName: leaderboard.name,
              entityType: 'leaderboard',
              inviteLink: inviteLink,
              invitedUserAvatar: currentUser.avatar,
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
