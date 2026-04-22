import {
  authMiddleware,
  pathParamValidatorMiddleware,
  bodyValidatorMiddleware,
  queryValidatorMiddleware,
  withMiddleware,
  optionalAuthMiddleware,
} from '@/backend/middleware';
import { paramValidator } from '@/backend/validators/index.validator';
import {
  leaderboardEntriesQueryValidatorSchema,
  updateLeaderboardValidatorSchema,
  type LeaderboardEntriesQueryValidatorSchema,
  type UpdateLeaderboardValidatorSchema,
} from '@/backend/validators/leaderboard.validator';
import { db } from '@/server/db';
import { type ApiResponse, type LeaderboardDetail, type LeaderboardListItem } from '@/types';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/utils/exceptions';
import { type Leaderboard, type Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

/**
 * @pathParams paramValidator
 * @body UpdateLeaderboardValidatorSchema
 * @description Updates an existing leaderboard for the authenticated user.
 */
export const PUT = withMiddleware<UpdateLeaderboardValidatorSchema>(
  async (request, { params }) => {
    try {
      const payload = request.validatedData!;
      const user = request.user!;
      const { id } = params;

      const leaderboard = await db.leaderboard.findUnique({
        where: { id },
      });

      if (!leaderboard) {
        throw new NotFoundException('Leaderboard not found');
      }

      if (leaderboard.createdById !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to update this leaderboard'
        );
      }

      if (
        (leaderboard.expiryDate && leaderboard.expiryDate < new Date()) ||
        !leaderboard.isActive
      ) {
        throw new ForbiddenException(
          'You cannot updated an expired or inactive leaderboard'
        );
      }

      const data: Prisma.LeaderboardUpdateInput = {};

      if (payload.name) data.name = payload.name;
      if (payload.description) data.description = payload.description;
      if (payload.isActive !== undefined) data.isActive = payload.isActive;
      if (payload.isPublic !== undefined) data.isPublic = payload.isPublic;
      if (payload.expiryDate) data.expiryDate = payload.expiryDate;
      if (payload.type) data.type = payload.type;

      if (payload.clubId) {
        data.club = {
          connect: { id: payload.clubId },
        };
      }

      const updatedLeaderboard = await db.leaderboard.update({
        where: { id },
        data,
      });

      const response: ApiResponse<Leaderboard> = {
        status: 200,
        message: 'Leaderboard updated successfully',
        data: updatedLeaderboard,
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while updating leaderboard: ${error.message}`
      );
    }
  },
  [
    authMiddleware,
    pathParamValidatorMiddleware(paramValidator),
    bodyValidatorMiddleware(updateLeaderboardValidatorSchema),
  ]
);

/**
 * @pathParams paramValidator
 * @description Deletes an existing leaderboard for the authenticated user.
 */
export const DELETE = withMiddleware<unknown>(
  async (request, { params }) => {
    try {
      const user = request.user!;
      const { id } = params;

      const leaderboard = await db.leaderboard.findUnique({
        where: { id },
      });

      if (!leaderboard) {
        throw new NotFoundException('Leaderboard not found');
      }

      if (leaderboard.createdById !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to delete this leaderboard'
        );
      }

      const deletedLeaderboard = await db.leaderboard.delete({
        where: { id },
      });

      const response: ApiResponse<Leaderboard> = {
        status: 200,
        message: 'Leaderboard deleted successfully',
        data: deletedLeaderboard,
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while deleting leaderboard: ${error.message}`
      );
    }
  },
  [authMiddleware, pathParamValidatorMiddleware(paramValidator)]
);

/**
 * @pathParams paramValidator
 * @queryParams LeaderboardEntriesQueryValidatorSchema
 * @description Retrieves a single leaderboard.
 */
export const GET = withMiddleware<
  unknown,
  LeaderboardEntriesQueryValidatorSchema
>(
  async (request, { params }) => {
    try {
      const { id } = params;
      const user = request.user;
      const query = request.query!;

      const sortBy = query.sortBy ?? 'effort';
      const sortOrder = query.sortOrder ?? (sortBy === 'pace' ? 'asc' : 'desc');

      let orderBy:
        | Prisma.UserLeaderboardOrderByWithRelationInput
        | Prisma.UserLeaderboardOrderByWithRelationInput[];

      if (sortBy === 'effort') {
        orderBy = [{ runDistance: sortOrder }, { runPace: 'asc' }];
      } else if (sortBy === 'fullname') {
        orderBy = {
          user: {
            fullname: sortOrder,
          },
        };
      } else if (sortBy === 'distance') {
        orderBy = { runDistance: sortOrder };
      } else if (sortBy === 'pace') {
        orderBy = { runPace: sortOrder };
      } else {
        orderBy = { [sortBy as any]: sortOrder };
      }

      const leaderboard = await db.leaderboard.findUnique({
        where: { id },
        include: {
          club: {
            select: {
              // id: true,
              // name: true,
              image: true,
              // slug: true,
            },
          },
          entries: {
            orderBy,
            include: {
              user: {
                select: {
                  id: true,
                  fullname: true,
                  username: true,
                  avatar: true,
                  type: true,
                  xp: true,
                  currentStreak: true,
                },
              },
            },
          },
          _count: {
            select: {
              entries: true,
            },
          },
        },
      });

      if (!leaderboard) {
        throw new NotFoundException('Leaderboard not found');
      }

      const isMember = user
        ? leaderboard.entries.some((e) => e.userId === user.id)
        : false;
      if (!leaderboard.isPublic && !isMember) {
        throw new ForbiddenException(
          'You are not authorized to view this leaderboard'
        );
      }

      // Ensure that entries with 0/missing pace stay at the bottom
      if (sortBy === 'pace' || sortBy === 'effort') {
        const isZeroPace = (pace: string | null) =>
          !pace || pace === '0' || pace === '0:00' || pace === '00:00';

        const parsePaceToSeconds = (pace: string | null) => {
          if (isZeroPace(pace)) return Infinity;
          const [min, sec] = pace!.split(':').map(Number);
          if (min !== undefined && sec !== undefined) return min * 60 + sec;
          if (min !== undefined) return min * 60;
          return Infinity;
        };

        const validEntries = leaderboard.entries.filter(
          (e) => !isZeroPace(e.runPace)
        );
        const zeroEntries = leaderboard.entries.filter((e) =>
          isZeroPace(e.runPace)
        );

        // Perform manual sort to handle inconsistent string padding
        validEntries.sort((a, b) => {
          if (sortBy === 'effort') {
            // Distance is already sorted correctly by the database.
            // We only need to handle ties where numeric pace sorting is required.
            if (a.runDistance !== b.runDistance) {
              return 0; // maintain database order for distances
            }
            // Tie-breaker: faster pace (lower seconds) ranks higher
            return (
              parsePaceToSeconds(a.runPace) - parsePaceToSeconds(b.runPace)
            );
          }

          // Pure pace sort: handle based on sortOrder with distance tie-breaker
          const paceA = parsePaceToSeconds(a.runPace);
          const paceB = parsePaceToSeconds(b.runPace);

          if (paceA === paceB) {
            return (b.runDistance ?? 0) - (a.runDistance ?? 0);
          }

          return sortOrder === 'asc' ? paceA - paceB : paceB - paceA;
        });

        // @ts-ignore - manual sort override
        leaderboard.entries = [...validEntries, ...zeroEntries];
      }

      // Normalize pace display for all entries (e.g., "07:06" -> "7:06")
      const entries = leaderboard.entries.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
        lastScoreDate: entry.lastScoreDate ? entry.lastScoreDate.toISOString() : null,
        runPace: entry.runPace
          ? entry.runPace.replace(/^0(?=\d)/, '')
          : entry.runPace,
      }));

      const response: ApiResponse<LeaderboardDetail> = {
        status: 200,
        message: 'Leaderboard retrieved successfully',
        data: {
          ...leaderboard,
          // image: leaderboard.club?.image ?? null,
          entries
        },
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while fetching leaderboard: ${error.message}`
      );
    }
  },
  [
    optionalAuthMiddleware,
    pathParamValidatorMiddleware(paramValidator),
    queryValidatorMiddleware(leaderboardEntriesQueryValidatorSchema),
  ]
);
