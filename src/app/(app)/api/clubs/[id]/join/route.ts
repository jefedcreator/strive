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
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@/utils/exceptions';
import { NextResponse } from 'next/server';

/**
 * @pathParams paramValidator
 * @description Join a club. If the club is private, it creates an invite request.
 * @auth bearer
 */
export const POST = withMiddleware<unknown>(
  async (request, { params }) => {
    try {
      const user = request.user!;
      const { id: clubId } = params;

      const club = await db.club.findUnique({
        where: { id: clubId },
      });

      if (!club) {
        throw new NotFoundException('Club not found');
      }

      // Check if user is already a member
      const existingMembership = await db.userClub.findUnique({
        where: {
          userId_clubId: {
            userId: user.id,
            clubId: clubId!,
          },
        },
      });

      if (existingMembership) {
        throw new ConflictException('You are already a member of this club');
      }

      if (club.isPublic) {
        await db.$transaction([
          db.userClub.create({
            data: {
              userId: user.id,
              clubId: clubId!,
              role: 'MEMBER',
            },
          }),
          db.club.update({
            where: { id: clubId },
            data: { memberCount: { increment: 1 } },
          }),
        ]);

        const response: ApiResponse<null> = {
          status: 200,
          message: 'Successfully joined the club',
          data: null,
        };

        return NextResponse.json(response);
      } else {
        const existingInvite = await db.clubInvites.findFirst({
          where: {
            userId: user.id,
            clubId,
          },
        });

        if (existingInvite) {
          throw new ConflictException(
            'You have already requested to join this club'
          );
        }

        await db.clubInvites.create({
          data: {
            userId: user.id,
            clubId: clubId!,
          },
        });

        const response: ApiResponse<null> = {
          status: 200,
          message:
            'Join request sent successfully. Waiting for owner approval.',
          data: null,
        };

        return NextResponse.json(response);
      }
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while joining club: ${error.message}`
      );
    }
  },
  [authMiddleware, pathParamValidatorMiddleware(paramValidator)]
);
