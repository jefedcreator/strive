import {
  authMiddleware,
  schemaValidatorMiddleware,
  withMiddleware,
} from "@/backend/middleware";
import {
  leaderboardValidatorSchema,
  type LeaderboardValidatorSchema,
} from "@/backend/validators/leaderboard.validator";
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";

/**
 * @body leaderboardValidatorSchema
 * @bodyDescription Authenticates a user and returns a JWT token. Currently supports Nike (NRC) login via puppeteer
 */
export const POST = withMiddleware<LeaderboardValidatorSchema>(
  async (request) => {
    const payload = request.validatedData!;
    const user = request.user!;
    const { files } = request;

    console.log("api payload", payload);
    console.log("api files", files);

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

    if (payload.userId) {
      data.user = {
        connect: {
          id: payload.userId,
        },
      };
    }

    if (payload.isActive !== undefined) {
      data.isActive = payload.isActive;
    }

    if (payload.isPublic !== undefined) {
      data.isPublic = payload.isPublic;
    }

    const identity = await db.leaderboard.create({
      data,
    });

    return Response.json(
      {
        status: 201,
        message: "KYB Identification created successfully",
        data: identity,
      },
      {
        status: 201,
      },
    );
  },
  [authMiddleware, schemaValidatorMiddleware(leaderboardValidatorSchema)],
);
