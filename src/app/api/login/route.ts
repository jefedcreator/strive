import { bodyValidatorMiddleware, withMiddleware } from '@/backend/middleware';
import { authService } from '@/backend/services/auth';
import { db } from '@/server/db';
import { puppeteerSessionManager } from '@/backend/services/puppeteer';
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
          const authorizationUrl = stravaService.getAuthorizationUrl({
            clubId: payload.clubId,
            leaderboardId: payload.leaderboardId,
            inviteId: payload.inviteId,
            rewardId: payload.rewardId,
            callbackUrl: payload.callbackUrl,
          });
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
      else {
        throw new Error('Invalid login type provided.');
      }


      return NextResponse.json({ status: 201 });
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while logging in: ${error.message}`
      );
    }
  },
  [bodyValidatorMiddleware(loginValidatorSchema)]
);
