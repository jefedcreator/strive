import {
    authMiddleware,
    pathParamValidatorMiddleware,
    withMiddleware,
} from '@/backend/middleware';
import { paramValidator } from '@/backend/validators/index.validator';
import { db } from '@/server/db';
import { type ApiResponse } from '@/types';
import {
    BadRequestException,
    ForbiddenException,
    InternalServerErrorException,
    NotFoundException,
} from '@/utils/exceptions';
import { NextResponse } from 'next/server';

/**
 * @pathParams paramValidator
 * @description Exit (leave) a leaderboard. The creator cannot leave their own leaderboard.
 * @auth bearer
 */
export const DELETE = withMiddleware<unknown>(
    async (request, { params }) => {
        try {
            const user = request.user!;
            const { id: leaderboardId = '' } = params;

            const leaderboard = await db.leaderboard.findUnique({
                where: { id: leaderboardId },
            });

            if (!leaderboard) {
                throw new NotFoundException('Leaderboard not found');
            }

            // Prevent the creator from leaving their own leaderboard
            // if (leaderboard.createdById === user.id) {
            //     throw new ForbiddenException(
            //         'The leaderboard creator cannot leave their own leaderboard'
            //     );
            // }

            // Check if user is actually a member
            const membership = await db.userLeaderboard.findUnique({
                where: {
                    userId_leaderboardId: {
                        userId: user.id,
                        leaderboardId,
                    },
                },
            });

            if (!membership) {
                throw new BadRequestException(
                    'You are not a member of this leaderboard'
                );
            }

            // Remove membership and notify the creator
            await db.$transaction([
                db.userLeaderboard.delete({
                    where: {
                        userId_leaderboardId: {
                            userId: user.id,
                            leaderboardId,
                        },
                    },
                }),
                db.notification.create({
                    data: {
                        userId: leaderboard.createdById,
                        message: `${user.fullname} left your leaderboard ${leaderboard.name}`,
                        type: 'info',
                        leaderboardId,
                    },
                }),
            ]);

            const response: ApiResponse<null> = {
                status: 200,
                message: 'Successfully left the leaderboard',
                data: null,
            };

            return NextResponse.json(response);
        } catch (error: any) {
            if (error.statusCode) throw error;
            throw new InternalServerErrorException(
                `An error occurred while leaving leaderboard: ${error.message}`
            );
        }
    },
    [authMiddleware, pathParamValidatorMiddleware(paramValidator)]
);
