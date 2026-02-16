import {
  authMiddleware,
  schemaValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import {
  clubQueryValidatorSchema,
  clubValidatorSchema,
  type ClubQueryValidatorSchema,
  type ClubValidatorSchema,
} from '@/backend/validators/club.validator';
import { db } from '@/server/db';
import { type ApiResponse, type PaginatedApiResponse } from '@/types';
import {
  InternalServerErrorException,
  ConflictException,
} from '@/utils/exceptions';
import { type Club, type Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { type QueryParameters } from '@/backend/middleware/types';

/**
 * @body ClubValidatorSchema
 * @description Creates a new club for the authenticated user.
 */
export const POST = withMiddleware<
  ClubValidatorSchema,
  QueryParameters
>(
  async (request) => {
    try {
      const payload = request.validatedData!;
      const user = request.user!;

      // Check if club with same name or slug already exists
      const existingClub = await db.club.findFirst({
        where: {
          OR: [{ name: payload.name }, { slug: payload.slug }],
        },
      });

      if (existingClub) {
        throw new ConflictException(
          'Club with this name or slug already exists'
        );
      }

      const data: Prisma.ClubCreateInput = {
        name: payload.name,
        slug: payload.slug,
        createdBy: {
          connect: {
            id: user.id,
          },
        },
      };

      if (payload.description) {
        data.description = payload.description;
      }

      if (payload.image) {
        data.image = payload.image;
      }

      if (payload.isActive !== undefined) {
        data.isActive = payload.isActive;
      }

      if (payload.isPublic !== undefined) {
        data.isPublic = payload.isPublic;
      }

      const club = await db.club.create({
        data,
      });

      // Also add the creator as a member (OWNER)
      await db.userClub.create({
        data: {
          userId: user.id,
          clubId: club.id,
          role: 'OWNER',
        },
      });

      // Update member count
      await db.club.update({
        where: { id: club.id },
        data: { memberCount: 1 },
      });

      const response: ApiResponse<Club> = {
        status: 201,
        message: 'Club created successfully',
        data: club,
      };

      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException(
        `An error occurred while creating club: ${(error as Error).message}`
      );
    }
  },
  [authMiddleware, schemaValidatorMiddleware(clubValidatorSchema)]
);

/**
 * @query ClubQueryValidatorSchema
 * @description Retrieves clubs. Supports search, pagination, and filtering.
 */
export const GET = withMiddleware<
  ClubQueryValidatorSchema,
  QueryParameters
>(
  async (request) => {
    try {
      const payload = request.validatedData!;
      const user = request.user!;

      const where: Prisma.ClubWhereInput = {};

      if (payload.isActive !== undefined) {
        where.isActive = payload.isActive;
      }

      if (payload.isPublic !== undefined) {
        where.isPublic = payload.isPublic;
      }

      if (payload.createdById) {
        where.createdById = payload.createdById;
      }

      if (payload.query) {
        where.OR = [
          { name: { contains: payload.query, mode: 'insensitive' } },
          { description: { contains: payload.query, mode: 'insensitive' } },
          { slug: { contains: payload.query, mode: 'insensitive' } },
        ];
      }

      const orderBy: Prisma.ClubOrderByWithRelationInput = {
        [payload.sortBy ?? 'createdAt']: payload.sortOrder ?? 'desc',
      };

      const include: Prisma.ClubInclude = {
        _count: {
          select: {
            members: true,
            leaderboards: true,
          },
        },
      };

      if (payload.all) {
        const data = await db.club.findMany({
          where,
          include,
          orderBy,
        });

        const count = data.length;

        const response: PaginatedApiResponse<typeof data> = {
          status: 200,
          message: 'Clubs retrieved successfully',
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
        db.club.count({ where }),
        db.club.findMany({
          where,
          take: size,
          skip,
          orderBy,
          include,
        }),
      ]);

      const response: PaginatedApiResponse<typeof data> = {
        status: 200,
        message: 'Clubs retrieved successfully',
        data,
        total: count,
        page,
        size,
        totalPages: Math.ceil(count / size),
      };

      return NextResponse.json(response);
    } catch (error) {
      throw new InternalServerErrorException(
        `An error occurred while fetching clubs: ${(error as Error).message}`
      );
    }
  },
  [authMiddleware, schemaValidatorMiddleware(clubQueryValidatorSchema)]
);
