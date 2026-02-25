import {
  authMiddleware,
  pathParamValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import { paramValidator } from '@/backend/validators/index.validator';
import { db } from '@/server/db';
import { type ApiResponse } from '@/types';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@/utils/exceptions';
import { NextResponse } from 'next/server';

/**
 * @pathParams paramValidator
 * @description Exit (leave) a club. The creator cannot leave their own club.
 * @auth bearer
 */
export const DELETE = withMiddleware<unknown>(
  async (request, { params }) => {
    try {
      const user = request.user!;
      const { id: clubId = '' } = params;

      const club = await db.club.findUnique({
        where: { id: clubId },
      });

      if (!club) {
        throw new NotFoundException('Club not found');
      }

      // Prevent the creator from leaving their own leaderboard
      // if (club.createdById === user.id) {
      //     throw new ForbiddenException(
      //         'The club creator cannot leave their own club'
      //     );
      // }

      // Check if user is actually a member
      const membership = await db.userClub.findUnique({
        where: {
          userId_clubId: {
            userId: user.id,
            clubId,
          },
        },
      });

      if (!membership) {
        throw new BadRequestException('You are not a member of this club');
      }

      // Remove membership and notify the creator
      await db.$transaction([
        db.userClub.delete({
          where: {
            userId_clubId: {
              userId: user.id,
              clubId,
            },
          },
        }),
        db.notification.create({
          data: {
            userId: club.createdById,
            message: `${user.fullname} left your club ${club.name}`,
            type: 'info',
            clubId,
          },
        }),
      ]);

      const response: ApiResponse<null> = {
        status: 200,
        message: 'Successfully left the club',
        data: null,
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while leaving club: ${error.message}`
      );
    }
  },
  [authMiddleware, pathParamValidatorMiddleware(paramValidator)]
);
