import { queryValidatorMiddleware, withMiddleware } from '@/backend/middleware';
import { authService } from '@/backend/services/auth';
import { stravaService } from '@/backend/services/strava';
import { InternalServerErrorException } from '@/utils/exceptions';
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
      let leaderboardId: string | undefined;
      let inviteId: string | undefined;
      let callbackUrl: string | undefined;

      console.log('leaderboardId', leaderboardId);
      console.log('inviteId', inviteId);

      if (state) {
        try {
          const parsedState = JSON.parse(state);
          clubId = parsedState.clubId;
          leaderboardId = parsedState.leaderboardId;
          inviteId = parsedState.inviteId;
          callbackUrl = parsedState.callbackUrl;
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
        refreshToken: auth.refreshToken,
        tokenExpiresAt: auth.expiresAt,
      });

      // Handle Club/Leaderboard Joins
      if (user) {
        await authService.syncUserMemberships({
          user,
          clubId,
          leaderboardId,
          inviteId,
        });
      }

      await authService.generateUserSession({
        id: user.id,
        email: user.email,
        avatar: user.avatar,
        type: user.type,
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usestrive.run';

      if (callbackUrl) {
        return NextResponse.redirect(new URL(callbackUrl, appUrl));
      } else if (clubId) {
        return NextResponse.redirect(new URL(`/clubs/${clubId}`, appUrl));
      } else if (leaderboardId) {
        return NextResponse.redirect(
          new URL(`/leaderboards/${leaderboardId}`, appUrl)
        );
      }

      return NextResponse.redirect(new URL('/home', appUrl));
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred during Strava authentication: ${error.message}`
      );
    }
  },
  [queryValidatorMiddleware(stravaCallbackQuerySchema)]
);
