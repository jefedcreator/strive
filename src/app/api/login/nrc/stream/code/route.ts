import { bodyValidatorMiddleware, withMiddleware } from '@/backend/middleware';
import { authService } from '@/backend/services/auth';
import { puppeteerSessionManager } from '@/backend/services/puppeteer';
import {
  nrcCodeValidatorSchema,
  type NrcCodeValidatorSchema,
} from '@/backend/validators/auth.validator';
import { UserType } from '@prisma/client';
import { NextResponse } from 'next/server';

export const POST = withMiddleware<NrcCodeValidatorSchema>(
  async (request) => {
    try {
      const { sessionId, code, clubId, leaderboardId, inviteId, callbackUrl } =
        request.validatedData!;

      const { email, token, username, avatar } =
        await puppeteerSessionManager.submitCode(sessionId, code);

      if (!email || !token || !username) {
        throw new Error(
          'Missing required user information from Nike authentication.'
        );
      }

      const user = await authService.findOrCreateUser({
        type: UserType.NRC,
        email,
        token,
        fullname: username,
        avatar,
      });

      if (!user) {
        throw new Error('User authentication failed.');
      }

      // --- Handle Club/Leaderboard Joining ---
      if (user) {
        await authService.syncUserMemberships({
          user,
          clubId: clubId ?? undefined,
          leaderboardId: leaderboardId ?? undefined,
          inviteId: inviteId ?? undefined,
        });
      }

      await authService.generateUserSession({
        id: user.id,
        email: user.email,
        avatar: user.avatar,
        type: user.type,
      });

      const redirectPath = clubId
        ? `/clubs/${clubId}`
        : leaderboardId
          ? `/leaderboards/${leaderboardId}`
          : callbackUrl
            ? callbackUrl
            : '/home';

      return NextResponse.json(
        {
          success: true,
          action: 'redirect',
          redirectUrl: redirectPath,
        },
        { status: 200 }
      );
    } catch (err: any) {
      console.error('[/api/nrc/code]', err.message);
      if (err.statusCode) throw err;
      return NextResponse.json(
        { error: `An error occurred while logging in: ${err.message}` },
        { status: 500 }
      );
    }
  },
  [bodyValidatorMiddleware(nrcCodeValidatorSchema)]
);
