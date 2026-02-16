import {
  authMiddleware,
  queryValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import {
  notificationQueryValidatorSchema,
  type NotificationQueryValidatorSchema,
} from '@/backend/validators/notification.validator';
import { db } from '@/server/db';
import { type PaginatedApiResponse } from '@/types';
import { InternalServerErrorException } from '@/utils/exceptions';
import { type Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

/**
 * @queryParams NotificationQueryValidatorSchema
 * @description Retrieves notifications for the authenticated user. Supports filtering by type, read status, and pagination.
 * @auth bearer
 */
export const GET = withMiddleware<unknown, NotificationQueryValidatorSchema>(
  async (request) => {
    try {
      const payload = request.query!;
      const user = request.user!;

      const where: Prisma.NotificationWhereInput = {
        userId: user.id,
      };

      if (payload.type) {
        where.type = payload.type;
      }

      if (payload.isRead !== undefined) {
        where.isRead = payload.isRead;
      }

      if (payload.query) {
        where.message = {
          contains: payload.query,
          mode: 'insensitive',
        };
      }

      const page = payload.page ?? 1;
      const size = payload.size ?? 10;
      const skip = (page - 1) * size;

      const orderBy: Prisma.NotificationOrderByWithRelationInput = {
        [payload.sortBy ?? 'createdAt']: payload.sortOrder ?? 'desc',
      };

      if (payload.all) {
        const data = await db.notification.findMany({
          where,
          orderBy,
        });

        const count = data.length;

        const response: PaginatedApiResponse<typeof data> = {
          status: 200,
          message: 'Notifications retrieved successfully',
          data,
          total: count,
          page: 1,
          size: count > 0 ? count : 1,
          totalPages: 1,
        };

        return NextResponse.json(response);
      }

      const [count, data] = await Promise.all([
        db.notification.count({ where }),
        db.notification.findMany({
          where,
          take: size,
          skip,
          orderBy,
        }),
      ]);

      const response: PaginatedApiResponse<typeof data> = {
        status: 200,
        message: 'Notifications retrieved successfully',
        data,
        total: count,
        page,
        size,
        totalPages: Math.ceil(count / size),
      };

      return NextResponse.json(response);
    } catch (error: any) {
      throw new InternalServerErrorException(
        `An error occurred while fetching notifications: ${error.message}`
      );
    }
  },
  [authMiddleware, queryValidatorMiddleware(notificationQueryValidatorSchema)]
);
