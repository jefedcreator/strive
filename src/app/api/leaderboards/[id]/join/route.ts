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
import { recalculateLeaderboardPositions } from '@/backend/services/leaderboards';
import type { Prisma } from '@prisma/client';

/**
 * @pathParams paramValidator
 * @description Join a leaderboard. If the leaderboard is private, it creates a join request.
 * @auth bearer
 */
export const POST = withMiddleware<unknown>(
  async (request, { params }) => {
    try {
      const user = request.user!;
      const { id: leaderboardId = '' } = params;

      const leaderboard = await db.leaderboard.findUnique({
        where: { id: leaderboardId },
        include: {
          club: {
            select: { name: true, createdById: true },
          },
        },
      });

      if (!leaderboard) {
        throw new NotFoundException('Leaderboard not found');
      }

      // Check if leaderboard is expired
      if (leaderboard.expiryDate && new Date() > leaderboard.expiryDate) {
        throw new BadRequestException('Cannot join an expired leaderboard');
      }

      // Check if user is already a member
      const existingMembership = await db.userLeaderboard.findUnique({
        where: {
          userId_leaderboardId: {
            userId: user.id,
            leaderboardId,
          },
        },
      });

      if (existingMembership) {
        return NextResponse.json({
          status: 200,
          message: 'You are already a member of this leaderboard',
          data: null,
        });
      }

      if (leaderboard.isPublic) {
        // Direct join for public leaderboards
        const transactionOps: Prisma.PrismaPromise<unknown>[] = [
          db.userLeaderboard.create({
            data: {
              userId: user.id,
              leaderboardId,
            },
          }),
          db.notification.create({
            data: {
              userId: leaderboard.createdById,
              message: `${user.fullname} joined your leaderboard ${leaderboard.name}`,
              type: 'info',
              leaderboardId,
            },
          }),
        ];

        // If the leaderboard belongs to a club, also add the user to that club
        if (leaderboard.clubId) {
          const existingClubMembership = await db.userClub.findUnique({
            where: {
              userId_clubId: {
                userId: user.id,
                clubId: leaderboard.clubId,
              },
            },
          });

          if (!existingClubMembership) {
            transactionOps.push(
              db.userClub.create({
                data: {
                  userId: user.id,
                  clubId: leaderboard.clubId,
                  role: 'MEMBER',
                },
              })
            );

            transactionOps.push(
              db.notification.create({
                data: {
                  userId: user.id,
                  message: `You've been added to the club associated with ${leaderboard.name}`,
                  type: 'club',
                  clubId: leaderboard.clubId,
                },
              })
            );

            transactionOps.push(
              db.notification.create({
                data: {
                  userId: leaderboard.club?.createdById!,
                  message: `${user.fullname} joined your club ${leaderboard.club?.name}`,
                  type: 'info',
                  clubId: leaderboard.clubId!,
                },
              })
            );
          }
        }

        await db.$transaction(transactionOps);

        // Recalculate positions for all entries after the new member joins
        await recalculateLeaderboardPositions(leaderboardId);

        const response: ApiResponse<null> = {
          status: 200,
          message: 'Successfully joined the leaderboard',
          data: null,
        };

        return NextResponse.json(response);
      } else {
        // For private leaderboards, create a join request (invite)
        const existingInvite = await db.leaderboardInvites.findFirst({
          where: {
            userId: user.id,
            leaderboardId,
          },
        });

        if (existingInvite) {
          throw new ConflictException(
            'You have already requested to join this leaderboard'
          );
        }

        await db.$transaction([
          db.leaderboardInvites.create({
            data: {
              userId: user.id,
              leaderboardId,
            },
          }),
          db.notification.create({
            data: {
              userId: leaderboard.createdById,
              message: `${user.fullname} wants to join your leaderboard ${leaderboard.name}`,
              type: 'leaderboard',
              leaderboardId,
            },
          }),
        ]);

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
        `An error occurred while joining leaderboard: ${error.message}`
      );
    }
  },
  [authMiddleware, pathParamValidatorMiddleware(paramValidator)]
);
