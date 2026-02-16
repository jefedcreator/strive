import {
  authMiddleware,
  bodyValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import { cloudinaryService } from '@/backend/services/cloudinary';
import {
  updateUserValidatorSchema,
  type UpdateUserValidatorSchema,
} from '@/backend/validators/auth.validator';
import { db } from '@/server/db';
import { type ApiResponse } from '@/types';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@/utils/exceptions';
import type { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

/**
 * @description Retrieves the authenticated user's profile, including clubs and leaderboards.
 * @auth bearer
 */
export const GET = withMiddleware<unknown>(
  async (request) => {
    try {
      const user = request.user!;

      const fullUser = await db.user.findUnique({
        where: { id: user.id },
        include: {
          clubs: {
            where: { isActive: true },
            include: {
              club: true,
            },
          },
          leaderboards: {
            where: { isActive: true },
            include: {
              leaderboard: true,
            },
          },
          createdClubs: true,
          createdLeaderboards: true,
        },
      });

      if (!fullUser) {
        throw new NotFoundException('User not found');
      }

      const response: ApiResponse<typeof fullUser> = {
        status: 200,
        message: 'User profile retrieved successfully',
        data: fullUser,
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while fetching profile: ${error.message}`
      );
    }
  },
  [authMiddleware]
);

/**
 * @body UpdateUserValidatorSchema
 * @description Updates the authenticated user's username or avatar.
 * @contentType multipart/form-data
 * @auth bearer
 */
export const PUT = withMiddleware<UpdateUserValidatorSchema>(
  async (request) => {
    try {
      const payload = request.validatedData!;
      const user = request.user!;

      if (payload.username) {
        const existingUser = await db.user.findFirst({
          where: {
            username: payload.username,
            NOT: { id: user.id },
          },
        });

        if (existingUser) {
          throw new ConflictException('Username is already taken');
        }
      }

      const data: Prisma.UserUpdateInput = {};
      if (payload.username) data.username = payload.username;

      if (payload.avatar instanceof File) {
        const uploadResult = await cloudinaryService.uploadFile(
          payload.avatar,
          {
            folder: 'strive/users',
          }
        );
        data.avatar = uploadResult.secure_url;
      }

      const updatedUser = await db.user.update({
        where: { id: user.id },
        data,
      });

      const response: ApiResponse<typeof updatedUser> = {
        status: 200,
        message: 'Profile updated successfully',
        data: updatedUser,
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while updating profile: ${error.message}`
      );
    }
  },
  [authMiddleware, bodyValidatorMiddleware(updateUserValidatorSchema)]
);

/**
 * @description Deletes the authenticated user's account.
 * @auth bearer
 */
export const DELETE = withMiddleware<unknown>(
  async (request) => {
    try {
      const user = request.user!;

      await db.user.delete({
        where: { id: user.id },
      });

      const response: ApiResponse<null> = {
        status: 200,
        message: 'Account deleted successfully',
        data: null,
      };

      return NextResponse.json(response);
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw new InternalServerErrorException(
        `An error occurred while deleting account: ${error.message}`
      );
    }
  },
  [authMiddleware]
);
