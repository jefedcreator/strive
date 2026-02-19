import { queryValidatorMiddleware, withMiddleware } from '@/backend/middleware';
import { authService } from '@/backend/services/auth';
import { stravaService } from '@/backend/services/strava';
import { signIn } from '@/server/auth';
import { db } from '@/server/db';
import { InternalServerErrorException } from '@/utils/exceptions';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const stravaCallbackQuerySchema = z.object({
  code: z.string({ required_error: 'code is required' }),
  state: z.string().optional(),
});

type StravaCallbackQuerySchema = z.infer<typeof stravaCallbackQuerySchema>;

/**
 * @queryParams StravaCallbackQuerySchema
 * @description Strava OAuth callback handler. Exchanges the authorization code for an access token and establishes a user session.
 */
export const GET = withMiddleware<unknown, StravaCallbackQuerySchema>(
  async (request) => {
    try {
      const { code, state } = request.query!;
      let clubId: string | undefined;
      let inviteId: string | undefined;

      if (state) {
        try {
          const parsedState = JSON.parse(state);
          clubId = parsedState.clubId;
          inviteId = parsedState.inviteId;
        } catch (e) {
          console.error('Failed to parse state:', e);
        }
      }

      const { auth, user: stravaUser } =
        await stravaService.exchangeToken(code);
      const user = await authService.findOrCreateUser({
        type: 'STRAVA',
        email: stravaUser.email,
        fullname: stravaUser.fullName,
        avatar: stravaUser.avatar,
        token: auth.accessToken,
      });

      // Handle Club Join if invite info is present
      if (clubId && inviteId && user) {
        // Check if already a member
        const existingMember = await db.userClub.findUnique({
          where: {
            userId_clubId: {
              userId: user.id,
              clubId,
            },
          },
        });

        if (!existingMember) {
          const club = await db.club.findUnique({
            where: {
              id: clubId,
            },
            select: {
              createdById: true,
              name: true,
            },
          });
          // Join the club
          await db.$transaction([
            db.userClub.create({
              data: {
                userId: user.id,
                clubId,
                role: 'MEMBER',
                isActive: true,
              },
            }),
            db.notification.create({
              data: {
                userId: club?.createdById ?? '',
                message: `${user.fullname} joined your club ${club?.name}`,
                type: 'info',
              },
            }),
            db.club.update({
              where: { id: clubId },
              data: { memberCount: { increment: 1 } },
            }),
            db.clubInvites.delete({
              where: { id: inviteId },
            }),
          ]);
        }
      }

      const jwtPayload = { uid: user.id, email: user.email };
      const jwtExpirationTimeInSec = 1 * 60 * 60 * 24; // 24 Hours
      const expiresAt = moment()
        .add(jwtExpirationTimeInSec, 'seconds')
        .toISOString();

      const auth_token = jwt.sign(jwtPayload, process.env.AUTH_SECRET!, {
        expiresIn: jwtExpirationTimeInSec,
      });

      console.log('accessToken', auth_token);

      await signIn('credentials', {
        userId: user.id,
        token: auth_token,
        redirect: false,
      });

      if (clubId) {
        return NextResponse.redirect(new URL(`/clubs/${clubId}`, request.url));
      }

      return NextResponse.redirect(new URL('/home', request.url));
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred during Strava authentication: ${error.message}`
      );
    }
  },
  [queryValidatorMiddleware(stravaCallbackQuerySchema)]
);
