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
import { emailService } from '@/backend/services/email';

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

      if (payload.type) {
        data.type = payload.type;
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

      const transactionOps: any[] = [
        db.userLeaderboard.create({
          data: {
            userId: user.id,
            leaderboardId: leaderboard.id,
          },
        }),
      ];

      // If the leaderboard belongs to a club, also add the creator to that club
      if (payload.clubId) {
        const existingClubMembership = await db.userClub.findUnique({
          where: {
            userId_clubId: {
              userId: user.id,
              clubId: payload.clubId,
            },
          },
        });

        if (!existingClubMembership) {
          transactionOps.push(
            db.userClub.create({
              data: {
                userId: user.id,
                clubId: payload.clubId,
                role: 'MEMBER',
              },
            })
          );

          transactionOps.push(
            db.notification.create({
              data: {
                userId: user.id,
                message: `You've been added to the club associated with your new leaderboard ${leaderboard.name}`,
                type: 'club',
                clubId: payload.clubId,
              },
            })
          );
        }
      }

      await db.$transaction(transactionOps);

      // Auto-invite/notify all club members if this is a public leaderboard created within a club
      if (payload.isPublic && payload.clubId) {
        const clubMembers = await db.userClub.findMany({
          where: { clubId: payload.clubId, userId: { not: user.id } },
          include: { user: true },
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usestrive.run';

        const invitePromises = clubMembers.map(async (member) => {
          const invite = await db.$transaction([
            db.leaderboardInvites.create({
              data: {
                userId: member.userId,
                leaderboardId: leaderboard.id,
                invitedBy: user.id,
                isRequest: false,
              },
            }),
            db.notification.create({
              data: {
                userId: member.userId,
                message: `${user.fullname} invited you to join their new leaderboard ${leaderboard.name}`,
                type: 'leaderboard',
                leaderboardId: leaderboard.id,
              },
            }),
          ]);

          const inviteLink = `${appUrl}/leaderboards/${leaderboard.id}/invites/${invite[0].id}`;

          try {
            await emailService.sendInviteEmail({
              to: member.user.email,
              invitedByUsername: user.fullname,
              invitedByEmail: user.email,
              entityName: leaderboard.name,
              entityType: 'leaderboard',
              inviteLink,
              invitedUserAvatar: user.avatar,
            });
          } catch (e) {
            console.error('Failed to send invite email:', e);
          }
        });

        await Promise.allSettled(invitePromises);
      }

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

      // If 'latest' is true, return the single most recently active leaderboard for the user, with top 5 entries
      if (payload.latest) {
        const latestMembership = await db.userLeaderboard.findFirst({
          where: {
            userId: user.id,
            isActive: true,
            leaderboard: {
              isActive: true,
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
          include: {
            leaderboard: {
              include: {
                club: {
                  select: { name: true, slug: true, image: true, id: true },
                },
                entries: {
                  where: { isActive: true },
                  orderBy: { score: 'desc' },
                  take: 5,
                  include: {
                    user: {
                      select: {
                        id: true,
                        fullname: true,
                        username: true,
                        avatar: true,
                        xp: true,
                        currentStreak: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!latestMembership) {
          return NextResponse.json({
            status: 200,
            message: 'No active leaderboards found',
            data: [],
            total: 0,
            page: 1,
            size: 1,
            totalPages: 0,
          });
        }

        const lbData = latestMembership.leaderboard;
        const mappedLatest = {
          ...lbData,
          isMember: true,
          _count: { entries: lbData.entries.length }, // We don't have total entries easily here, just the top 5
        };

        return NextResponse.json({
          status: 200,
          message: 'Latest leaderboard retrieved successfully',
          data: [mappedLatest],
          total: 1,
          page: 1,
          size: 1,
          totalPages: 1,
        });
      }

      // Visibility: public leaderboards are always visible;
      // private ones only if the user has an active entry.
      const visibilityCondition: Prisma.LeaderboardWhereInput = {
        OR: [
          { isPublic: true },
          {
            isPublic: false,
            entries: {
              some: {
                userId: user.id,
                isActive: true,
              },
            },
          },
        ],
      };

      const where: Prisma.LeaderboardWhereInput = {
        AND: [visibilityCondition],
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
        // Append search OR alongside the visibility AND — avoids overwriting it
        (where.AND as Prisma.LeaderboardWhereInput[]).push({
          OR: [
            { name: { contains: payload.query, mode: 'insensitive' } },
            { description: { contains: payload.query, mode: 'insensitive' } },
          ],
        });
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
        // Include only the current user's entry to determine isMember
        entries: {
          where: { userId: user.id, isActive: true },
          select: { id: true },
          take: 1,
        },
      };

      if (payload.all) {
        const data = await db.leaderboard.findMany({
          where,
          include,
          orderBy,
        });

        const count = data.length;

        const mappedData = data.map(({ entries, ...rest }) => ({
          ...rest,
          isMember: entries.length > 0,
        }));

        const response: PaginatedApiResponse<LeaderboardListItem[]> = {
          status: 200,
          message: 'Leaderboards retrieved successfully',
          data: mappedData,
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

      const mappedData = data.map(({ entries, ...rest }) => ({
        ...rest,
        isMember: entries.length > 0,
      }));

      const response: PaginatedApiResponse<LeaderboardListItem[]> = {
        status: 200,
        message: 'Leaderboards retrieved successfully',
        data: mappedData,
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
