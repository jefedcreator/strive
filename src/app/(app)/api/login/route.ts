import { bodyValidatorMiddleware, withMiddleware } from '@/backend/middleware';
import { authService } from '@/backend/services/auth';
import { puppeteerService } from '@/backend/services/puppeteer';
import { stravaService } from '@/backend/services/strava';
import {
  loginValidatorSchema,
  type LoginValidatorSchema,
} from '@/backend/validators/auth.validator';
import { signIn } from '@/server/auth';
import { InternalServerErrorException } from '@/utils/exceptions';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { NextResponse } from 'next/server';

/**
 * @body LoginValidatorSchema
 * @bodyDescription Authenticates a user and returns a JWT token. Currently supports Nike (NRC) login via puppeteer
 */
export const POST = withMiddleware<LoginValidatorSchema>(
  async (request) => {
    try {
      const payload = request.validatedData;
      let user;

      // ---------------------------------------------------------
      // 1. STRAVA HANDLER (Two-Step Flow)
      // ---------------------------------------------------------
      if (payload?.type === 'strava') {
        if (!payload.code) {
          const authorizationUrl = stravaService.getAuthorizationUrl();
          return NextResponse.json({
            status: 200,
            action: 'redirect',
            url: authorizationUrl,
          });
        }
      }

      // ---------------------------------------------------------
      // 2. NRC HANDLER (One-Step Flow)
      // ---------------------------------------------------------
      else if (payload?.type === 'nrc') {
        // NRC is automated/synchronous, so we just do it all at once
        const { email, token, username } =
          await puppeteerService.captureNikeAuth();

        if (!email || !token || !username) {
          throw new Error(
            'Missing required user information from Nike authentication.'
          );
        }

        user = await authService.findOrCreateUser({
          type: 'NRC',
          email,
          token,
          fullname: username,
        });
      } else {
        throw new Error('Invalid login type provided.');
      }

      // ---------------------------------------------------------
      // 3. ESTABLISH SESSION (Auth.js)
      // ---------------------------------------------------------
      if (!user) {
        throw new Error('User authentication failed.');
      }

      // ---------------------------------------------------------
      // 4. GENERATE JWT FOR API AUTHENTICATION
      // ---------------------------------------------------------
      const jwtPayload = { uid: user.id, email: user.email };
      const jwtExpirationTimeInSec = 1 * 60 * 60 * 24; // 24 Hours
      const expiresAt = moment()
        .add(jwtExpirationTimeInSec, 'seconds')
        .toISOString();

      const auth_token = jwt.sign(jwtPayload, process.env.AUTH_SECRET!, {
        expiresIn: jwtExpirationTimeInSec,
      });

      await signIn('credentials', {
        userId: user.id,
        redirect: false,
        token: auth_token,
      });

      return NextResponse.json(
        {
          status: 201,
          data: {
            ...user,
            token: auth_token,
            expiresAt,
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while logging in: ${error.message}`
      );
    }
  },
  [bodyValidatorMiddleware(loginValidatorSchema)]
);
