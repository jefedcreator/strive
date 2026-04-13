import {
  authMiddleware,
  optionalAuthMiddleware,
  queryValidatorMiddleware,
  withMiddleware,
} from '@/backend/middleware';
import {
  exploreQueryValidatorSchema,
  type ExploreQueryValidatorSchema,
} from '@/backend/validators/explore.validator';
import { db } from '@/server/db';
import { type ExploreListItem, type PaginatedApiResponse } from '@/types';
import { InternalServerErrorException } from '@/utils/exceptions';
import { type Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

/**
 * @queryParams ExploreQueryValidatorSchema
 * @description Retrieves a unified feed of clubs and leaderboards ordered by createdAt.
 * Supports filtering by type ('clubs' or 'leaderboards').
 */
export const GET = withMiddleware<unknown, ExploreQueryValidatorSchema>(
  async (request) => {
    try {
      const payload = request.query!;
      const user = request.user; // Can be null with optionalAuthMiddleware
      const page = payload.page ?? 1;
      const size = payload.size ?? 10;
      const skip = (page - 1) * size;
      const query = payload.query;
      const type = payload.type;

      // Base conditions: public items are always visible.
      // Private items are only visible if the user is authenticated and a member.
      const clubWhere: Prisma.ClubWhereInput = {
        isActive: true,
        OR: [{ isPublic: true }],
      };

      const lbWhere: Prisma.LeaderboardWhereInput = {
        isActive: true,
        OR: [{ isPublic: true }],
      };

      if (user) {
        clubWhere.OR?.push({
          isPublic: false,
          members: { some: { userId: user.id, isActive: true } },
        });
        lbWhere.OR?.push({
          isPublic: false,
          entries: { some: { userId: user.id, isActive: true } },
        });
      }

      if (query) {
        clubWhere.AND = [
          ...(Array.isArray(clubWhere.AND) ? clubWhere.AND : []),
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { slug: { contains: query, mode: 'insensitive' } },
            ],
          },
        ];
        lbWhere.AND = [
          ...(Array.isArray(lbWhere.AND) ? lbWhere.AND : []),
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
        ];
      }

      let total = 0;
      let combinedData: ExploreListItem[] = [];

      const clubInclude: Prisma.ClubInclude = {
        _count: { select: { members: true, leaderboards: true } },
      };

      const lbInclude: Prisma.LeaderboardInclude = {
        club: { select: { id: true, name: true, image: true, slug: true } },
        _count: { select: { entries: true } },
      };

      if (user) {
        clubInclude.members = {
          where: { userId: user.id, isActive: true },
          select: { id: true },
          take: 1,
        };
        lbInclude.entries = {
          where: { userId: user.id, isActive: true },
          select: { id: true },
          take: 1,
        };
      }

      if (type === 'clubs') {
        const [count, clubs] = await Promise.all([
          db.club.count({ where: clubWhere }),
          db.club.findMany({
            where: clubWhere,
            take: size,
            skip,
            orderBy: { createdAt: 'desc' },
            include: clubInclude,
          }),
        ]);
        total = count;
        combinedData = clubs.map(({ _count, members, ...rest }) => ({
          ...rest,
          kind: 'club',
          leaderboards: _count.leaderboards,
          members: _count.members,
          isMember: !!(members && members.length > 0),
        })) as ExploreListItem[];
      } else if (type === 'leaderboards') {
        const [count, leaderboards] = await Promise.all([
          db.leaderboard.count({ where: lbWhere }),
          db.leaderboard.findMany({
            where: lbWhere,
            take: size,
            skip,
            orderBy: { createdAt: 'desc' },
            include: lbInclude,
          }),
        ]);
        total = count;
        combinedData = leaderboards.map(
          ({ entries, type: leaderboardType, ...rest }) => ({
            ...rest,
            kind: 'leaderboard' as const,
            leaderboardType,
            isMember: !!(entries && entries.length > 0),
          })
        ) as unknown as ExploreListItem[];
      } else {
        // Fetch both for interleaved result
        const [clubCount, lbCount, clubs, leaderboards] = await Promise.all([
          db.club.count({ where: clubWhere }),
          db.leaderboard.count({ where: lbWhere }),
          db.club.findMany({
            where: clubWhere,
            take: skip + size,
            orderBy: { createdAt: 'desc' },
            include: clubInclude,
          }),
          db.leaderboard.findMany({
            where: lbWhere,
            take: skip + size,
            orderBy: { createdAt: 'desc' },
            include: lbInclude,
          }),
        ]);

        total = clubCount + lbCount;

        const mappedClubs = clubs.map(({ _count, members, ...rest }) => ({
          ...rest,
          kind: 'club' as const,
          leaderboards: _count.leaderboards,
          members: _count.members,
          isMember: !!(members && members.length > 0),
        }));

        const mappedLbs = leaderboards.map(
          ({ entries, type: leaderboardType, ...rest }) => ({
            ...rest,
            kind: 'leaderboard' as const,
            leaderboardType,
            isMember: !!(entries && entries.length > 0),
          })
        );

        combinedData = [...mappedClubs, ...mappedLbs]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(skip, skip + size) as ExploreListItem[];
      }

      const response: PaginatedApiResponse<ExploreListItem[]> = {
        status: 200,
        message: 'Explore items retrieved successfully',
        data: combinedData,
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      };

      return NextResponse.json(response);
    } catch (error) {
      throw new InternalServerErrorException(
        `An error occurred while fetching explore items: ${(error as Error).message}`
      );
    }
  },
  [
    optionalAuthMiddleware,
    queryValidatorMiddleware(exploreQueryValidatorSchema),
  ]
);
