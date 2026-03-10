import { authMiddleware, withMiddleware } from '@/backend/middleware';
import { db } from '@/server/db';
import { type ApiResponse } from '@/types';
import { InternalServerErrorException } from '@/utils/exceptions';
import { NextResponse } from 'next/server';

/**
 * @description Search users by email. Returns public profile data.
 * @auth bearer
 */
export const GET = withMiddleware<any, any>(
  async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const email = searchParams.get('email');

      if (!email || email.length < 3) {
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
        // Return a mock user object for unregistered valid emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

      const response: ApiResponse<typeof user> = {
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
  [authMiddleware]
);
