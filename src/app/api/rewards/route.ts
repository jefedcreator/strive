import { authMiddleware, withMiddleware } from '@/backend/middleware';
import type { AuthRequest } from '@/backend/middleware/types';
import { db } from '@/server/db';
import { type ApiResponse } from '@/types';
import { InternalServerErrorException } from '@/utils/exceptions';
import { NextResponse } from 'next/server';
import { getTier, getNextTier } from '@/backend/services/xp';

/**
 * @description Get the authenticated user's rewards with badge URLs.
 */
export const GET = withMiddleware(
    async (request: AuthRequest) => {
        try {
            const user = request.user!;

            const userRewards = await db.userReward.findMany({
                where: { userId: user.id },
                include: {
                    reward: {
                        include: {
                            leaderboard: { select: { id: true, name: true, clubId: true } },
                            club: { select: { id: true, name: true, slug: true } },
                        },
                    },
                },
                orderBy: { earnedAt: 'desc' },
            });

            const rewards = userRewards.map((ur) => {
                const r = ur.reward;
                const badgeType =
                    r.type === 'GOLD'
                        ? 'gold'
                        : r.type === 'SILVER'
                            ? 'silver'
                            : r.type === 'BRONZE'
                                ? 'bronze'
                                : 'club';

                const badgeParams = new URLSearchParams({
                    type: badgeType,
                    title: r.title,
                    ...(r.description ? { subtitle: r.description } : {}),
                    ...(r.milestone ? { milestone: String(r.milestone) } : {}),
                });

                return {
                    id: ur.id,
                    rewardId: r.id,
                    type: r.type,
                    title: r.title,
                    description: r.description,
                    earnedAt: ur.earnedAt,
                    leaderboard: r.leaderboard,
                    club: r.club,
                    milestone: r.milestone,
                    badgeUrl: `/api/rewards/badge?${badgeParams.toString()}`,
                };
            });

            const currentTier = getTier(user.xp ?? 0);
            const nextTier = getNextTier(user.xp ?? 0);

            const response: ApiResponse<{
                rewards: typeof rewards;
                xp: number;
                currentStreak: number;
                longestStreak: number;
                tier: { name: string; emoji: string; threshold: number };
                nextTier: { name: string; emoji: string; threshold: number } | null;
                tierBadgeUrl: string;
            }> = {
                status: 200,
                message: 'Rewards retrieved successfully',
                data: {
                    rewards,
                    xp: user.xp ?? 0,
                    currentStreak: user.currentStreak ?? 0,
                    longestStreak: user.longestStreak ?? 0,
                    tier: currentTier,
                    nextTier,
                    tierBadgeUrl: `/api/rewards/tier-badge?tier=${currentTier.name.toLowerCase()}&username=${encodeURIComponent(user.fullname ?? 'Runner')}&xp=${user.xp ?? 0}`,
                },
            };

            return NextResponse.json(response);
        } catch (error: any) {
            if (error.statusCode) throw error;
            throw new InternalServerErrorException(
                `An error occurred while fetching rewards: ${error.message}`
            );
        }
    },
    [authMiddleware]
);
