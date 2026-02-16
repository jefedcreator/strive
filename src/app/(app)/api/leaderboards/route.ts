import {
  authMiddleware,
  schemaValidatorMiddleware,
  withMiddleware,
} from "@/backend/middleware";
import {
  leaderboardQueryValidatorSchema,
  leaderboardValidatorSchema,
  type LeaderboardQueryValidatorSchema,
  type LeaderboardValidatorSchema,
} from "@/backend/validators/leaderboard.validator";
import { db } from "@/server/db";
import { type Prisma } from "@prisma/client";

/**
 * @body leaderboardValidatorSchema
 * @bodyDescription Authenticates a user and returns a JWT token. Currently supports Nike (NRC) login via puppeteer
 */
export const POST = withMiddleware<LeaderboardValidatorSchema>(
  async (request) => {
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

    const leaderboard = await db.leaderboard.create({
      data,
    });

    return Response.json(
      {
        status: 201,
        message: "Leaderboard created successfully",
        data: leaderboard,
      },
      {
        status: 201,
      },
    );
  },
  [authMiddleware, schemaValidatorMiddleware(leaderboardValidatorSchema)],
);

export const GET = withMiddleware<LeaderboardQueryValidatorSchema>(
  async (request) => {
    const payload = request.validatedData!;
    const user = request.user!;

    const where: Prisma.LeaderboardWhereInput = {
      entries: {
        some: {
          userId: user.id,
          isActive: true,
        },
      },
    };

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
        { name: { contains: payload.query, mode: "insensitive" } },
        { description: { contains: payload.query, mode: "insensitive" } },
      ];
    }

    const page = payload.page ?? 1;
    const limit = payload.size ?? 10;
    const skip = (page - 1) * limit;

    const [count, data] = await Promise.all([
      db.leaderboard.count({ where }),
      db.leaderboard.findMany({
        where,
        take: limit,
        skip,
        orderBy: {
          [payload.sortBy ?? "createdAt"]: payload.sortOrder ?? "desc",
        },
        include: {
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
        },
      }),
    ]);

    return Response.json({
      status: 200,
      message: "Leaderboards retrieved successfully",
      data,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  },
  [authMiddleware, schemaValidatorMiddleware(leaderboardQueryValidatorSchema)],
);
