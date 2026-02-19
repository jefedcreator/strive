import {
  authMiddleware,
  bodyValidatorMiddleware,
  queryValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import {
  leaderboardQueryValidatorSchema,
  leaderboardValidatorSchema,
  type LeaderboardQueryValidatorSchema,
  type LeaderboardValidatorSchema,
} from '@/backend/validators/leaderboard.validator';
import { db } from '@/server/db';
import {
  type ApiResponse,
  type LeaderboardListItem,
  type PaginatedApiResponse,
} from '@/types';
import {
  ConflictException,
  InternalServerErrorException,
} from '@/utils/exceptions';
import { type Leaderboard, type Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

/**
 * @body LeaderboardValidatorSchema
 * @description Creates a new leaderboard for the authenticated user. Allows specifying a name, optional description, club association, visibility, and an optional expiry date.
 */
export const POST = withMiddleware<LeaderboardValidatorSchema>(
  async (request) => {
    try {
      const payload = request.validatedData!;
      const user = request.user!;

      const data: Prisma.LeaderboardCreateInput = {
        name: payload.name,
        createdBy: {
          connect: {
            id: user.id,
          },
        },
      };

      if (payload.description) {
        data.description = payload.description;
      }

      if (payload.clubId) {
        data.club = {
          connect: {
            id: payload.clubId,
          },
        };
      }

      if (payload.isActive !== undefined) {
        data.isActive = payload.isActive;
      }

      if (payload.isPublic !== undefined) {
        data.isPublic = payload.isPublic;
      }

      if (payload.expiryDate) {
        data.expiryDate = payload.expiryDate;
      }

      const existingLeaderboard = await db.leaderboard.findFirst({
        where: {
          name: payload.name,
        },
      });

      if (existingLeaderboard) {
        throw new ConflictException(
          'Leaderboard with this name already exists'
        );
      }

      const leaderboard = await db.leaderboard.create({
        data,
      });

      await db.userLeaderboard.create({
        data: {
          userId: user.id,
          leaderboardId: leaderboard.id,
        },
      });

      const response: ApiResponse<Leaderboard> = {
        status: 201,
        message: 'Leaderboard created successfully',
        data: leaderboard,
      };

      return NextResponse.json(response, { status: 201 });
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while creating leaderboard: ${error.message}`
      );
    }
  },
  [authMiddleware, bodyValidatorMiddleware(leaderboardValidatorSchema)]
);

/**
 * @queryParams LeaderboardQueryValidatorSchema
 * @description Retrieves leaderboards for the authenticated user. Supports search, pagination, and filtering by club, creator, or status.
 */
export const GET = withMiddleware<LeaderboardQueryValidatorSchema>(
  async (request) => {
    try {
      const payload = request.query!;
      const user = request.user!;

      const where: Prisma.LeaderboardWhereInput = {
        entries: {
          some: {
            userId: user.id,
            isActive: true,
          },
        },
      };

      console.log('payload', payload);


      if (payload.isActive !== undefined) {
        where.isActive = payload.isActive;
      }

      if (payload.isPublic !== undefined) {
        where.isPublic = payload.isPublic;
      }

      if (payload.clubId) {
        where.clubId = payload.clubId;
      }

      if (payload.createdById) {
        where.createdById = payload.createdById;
      }

      if (payload.query) {
        where.OR = [
          { name: { contains: payload.query, mode: 'insensitive' } },
          { description: { contains: payload.query, mode: 'insensitive' } },
        ];
      }

      const orderBy: Prisma.LeaderboardOrderByWithRelationInput = {
        [payload.sortBy ?? 'createdAt']: payload.sortOrder ?? 'desc',
      };

      const include: Prisma.LeaderboardInclude = {
        club: {
          select: {
            id: true,
            name: true,
            image: true,
            slug: true,
          },
        },
        _count: {
          select: {
            entries: true,
          },
        },
      };

      if (payload.all) {
        const data = await db.leaderboard.findMany({
          where,
          include,
          orderBy,
        });

        const count = data.length;

        const response: PaginatedApiResponse<LeaderboardListItem[]> = {
          status: 200,
          message: 'Leaderboards retrieved successfully',
          data,
          total: count,
          page: 1,
          size: count > 0 ? count : 1,
          totalPages: 1,
        };

        return NextResponse.json(response);
      }

      const page = payload.page ?? 1;
      const size = payload.size ?? 10;
      const skip = (page - 1) * size;

      const [count, data] = await Promise.all([
        db.leaderboard.count({ where }),
        db.leaderboard.findMany({
          where,
          take: size,
          skip,
          orderBy,
          include,
        }),
      ]);

      const response: PaginatedApiResponse<LeaderboardListItem[]> = {
        status: 200,
        message: 'Leaderboards retrieved successfully',
        data,
        total: count,
        page,
        size,
        totalPages: Math.ceil(count / size),
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while fetching leaderboards: ${error.message}`
      );
    }
  },
  [authMiddleware, queryValidatorMiddleware(leaderboardQueryValidatorSchema)]
);
