import {
  queryValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import { authService } from '@/backend/services/auth';
import { stravaService } from '@/backend/services/strava';
import { signIn } from '@/server/auth';
import { InternalServerErrorException } from '@/utils/exceptions';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const stravaCallbackQuerySchema = z.object({
  code: z.string({ required_error: 'code is required' }),
});

type StravaCallbackQuerySchema = z.infer<typeof stravaCallbackQuerySchema>;

/**
 * @queryParams StravaCallbackQuerySchema
 * @description Strava OAuth callback handler. Exchanges the authorization code for an access token and establishes a user session.
 */
export const GET = withMiddleware<unknown, StravaCallbackQuerySchema>(
  async (request) => {
    try {
      const { code } = request.query!;

      const { auth, user: stravaUser } = await stravaService.exchangeToken(code);
      const user = await authService.findOrCreateUser({
        type: 'STRAVA',
        email: stravaUser.email,
        username: stravaUser.fullName,
        avatar: stravaUser.avatar,
        token: auth.accessToken,
      });

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
