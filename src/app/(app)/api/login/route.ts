import { bodyValidatorMiddleware, withMiddleware } from '@/backend/middleware';
import { authService } from '@/backend/services/auth';
import { db } from '@/server/db';
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
          const authorizationUrl = stravaService.getAuthorizationUrl({
            clubId: payload.clubId,
            leaderboardId: payload.leaderboardId,
            inviteId: payload.inviteId,
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
      else if (payload?.type === 'nrc') {
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

        const { clubId, leaderboardId, inviteId } = payload;
        if (clubId && inviteId && user) {
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

        if (leaderboardId && inviteId && user) {
          const existingEntry = await db.userLeaderboard.findUnique({
            where: {
              userId_leaderboardId: {
                userId: user.id,
                leaderboardId,
              },
            },
          });

          if (!existingEntry) {
            await db.$transaction([
              db.userLeaderboard.create({
                data: {
                  userId: user.id,
                  leaderboardId,
                },
              }),
              db.leaderboardInvites.delete({
                where: { id: inviteId },
              }),
            ]);
          }
        }
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
        image: user.avatar,
      });

      const responsePayload: any = {
        status: 201,
        data: {
          ...user,
          token: auth_token,
          expiresAt,
        },
      };

      if (payload?.type === 'nrc') {
        if (payload?.clubId) {
          responsePayload.action = 'redirect';
          responsePayload.url = `/clubs/${payload.clubId}`;
        } else if (payload?.leaderboardId) {
          responsePayload.action = 'redirect';
          responsePayload.url = `/leaderboards/${payload.leaderboardId}`;
        }
      }

      return NextResponse.json(responsePayload, { status: 201 });
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while logging in: ${error.message}`
      );
    }
  },
  [bodyValidatorMiddleware(loginValidatorSchema)]
);
