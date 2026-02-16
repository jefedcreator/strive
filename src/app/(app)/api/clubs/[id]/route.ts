import {
  authMiddleware,
  pathParamValidatorMiddleware,
  bodyValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import { cloudinaryService } from '@/backend/services/cloudinary';
import {
  updateClubValidatorSchema,
  type UpdateClubValidatorSchema,
} from '@/backend/validators/club.validator';
import { paramValidator } from '@/backend/validators/index.validator';
import { db } from '@/server/db';
import { type ApiResponse } from '@/types';
import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/utils/exceptions';
import { type Club, type Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

/**
 * @body UpdateClubValidatorSchema
 * @pathParams paramValidator
 * @description Updates an existing club for the authenticated user.
 * @contentType multipart/form-data
 * @auth bearer
 */
export const PUT = withMiddleware<UpdateClubValidatorSchema>(
  async (request, { params }) => {
    try {
      const payload = request.validatedData!;
      const user = request.user!;
      const { id } = params;

      const club = await db.club.findUnique({
        where: { id },
      });

      if (!club) {
        throw new NotFoundException('Club not found');
      }

      if (club.createdById !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to update this club'
        );
      }

      if (payload.name || payload.slug) {
        const existingClub = await db.club.findFirst({
          where: {
            OR: [
              payload.name ? { name: payload.name } : {},
              payload.slug ? { slug: payload.slug } : {},
            ],
            NOT: { id },
          },
        });

        if (existingClub) {
          throw new ConflictException(
            'Club with this name or slug already exists'
          );
        }
      }

      const data: Prisma.ClubUpdateInput = {};

      if (payload.name) data.name = payload.name;
      if (payload.description) data.description = payload.description;
      if (payload.image instanceof File) {
        const uploadResult = await cloudinaryService.uploadFile(payload.image, {
          folder: 'clubs',
        });
        data.image = uploadResult.secure_url;
      }
      if (payload.slug) data.slug = payload.slug;
      if (payload.isActive !== undefined) data.isActive = payload.isActive;
      if (payload.isPublic !== undefined) data.isPublic = payload.isPublic;

      const updatedClub = await db.club.update({
        where: { id },
        data,
      });

      const response: ApiResponse<Club> = {
        status: 200,
        message: 'Club updated successfully',
        data: updatedClub,
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while updating club: ${error.message}`
      );
    }
  },
  [
    authMiddleware,
    pathParamValidatorMiddleware(paramValidator),
    bodyValidatorMiddleware(updateClubValidatorSchema),
  ]
);

/**
 * @pathParams paramValidator
 * @description Deletes an existing club for the authenticated user.
 */
export const DELETE = withMiddleware<unknown>(
  async (request, { params }) => {
    try {
      const user = request.user!;
      const { id } = params;

      const club = await db.club.findUnique({
        where: { id },
      });

      if (!club) {
        throw new NotFoundException('Club not found');
      }

      if (club.createdById !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to delete this club'
        );
      }

      const deletedClub = await db.club.delete({
        where: { id },
      });

      const response: ApiResponse<Club> = {
        status: 200,
        message: 'Club deleted successfully',
        data: deletedClub,
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while deleting club: ${error.message}`
      );
    }
  },
  [authMiddleware, pathParamValidatorMiddleware(paramValidator)]
);

/**
 * @pathParams paramValidator
 * @description Retrieves a single club.
 */
export const GET = withMiddleware<unknown>(
  async (request, { params }) => {
    try {
      const { id } = params;

      const club = await db.club.findUnique({
        where: { id },
        include: {
          members: true,
          leaderboards: true,
          _count: {
            select: {
              members: true,
              leaderboards: true,
            },
          },
        },
      });

      if (!club) {
        throw new NotFoundException('Club not found');
      }

      const response: ApiResponse<typeof club> = {
        status: 200,
        message: 'Club retrieved successfully',
        data: club,
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while fetching club: ${error.message}`
      );
    }
  },
  [authMiddleware, pathParamValidatorMiddleware(paramValidator)]
);
