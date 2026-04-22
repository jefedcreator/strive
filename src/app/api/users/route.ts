import {
  authMiddleware,
  queryValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import {
  baseQueryValidatorSchema,
  type BaseQueryValidatorSchema,
} from '@/backend/validators/index.validator';
import { db } from '@/server/db';
import { type ApiResponse, type SearchedUser } from '@/types';
import { InternalServerErrorException } from '@/utils/exceptions';
import { NextResponse } from 'next/server';

/**
 * @description Search users by email. Returns public profile data.
 * @auth bearer
 */
export const GET = withMiddleware<BaseQueryValidatorSchema>(
  async (request) => {
    try {
      const payload = request.query;
      const email = payload?.query;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        const response: ApiResponse<null> = {
          status: 400,
          message: 'Valid email is required',
          data: null,
        };
        return NextResponse.json(response, { status: 400 });
      }

      const user = await db.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          fullname: true,
          avatar: true,
          username: true,
        },
      });

      if (!user) {
        if (emailRegex.test(email)) {
          const fallbackNameMatch = email.match(/^([^@]+)@/);
          const fallbackName = fallbackNameMatch ? fallbackNameMatch[1] : email;

          const response: ApiResponse<any> = {
            status: 200,
            message: 'Valid external email',
            data: {
              id: email, // use email as ID signal for external invites
              fullname: fallbackName,
              avatar: null,
              username: null,
              isExternal: true,
            },
          };
          return NextResponse.json(response, { status: 200 });
        }

        const response: ApiResponse<null> = {
          status: 404,
          message: 'Invalid or missing user',
          data: null,
        };
        return NextResponse.json(response, { status: 404 });
      }

      const response: ApiResponse<SearchedUser> = {
        status: 200,
        message: 'User found successfully',
        data: user,
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while searching user: ${error.message}`
      );
    }
  },
  [authMiddleware, queryValidatorMiddleware(baseQueryValidatorSchema)]
);
