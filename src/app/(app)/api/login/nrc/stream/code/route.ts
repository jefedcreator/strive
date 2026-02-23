import { authService } from '@/backend/services/auth';
import { puppeteerSessionManager } from '@/backend/services/puppeteer/session';
import { signIn } from '@/server/auth';
import { db } from '@/server/db';
import { InternalServerErrorException } from '@/utils/exceptions';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as {
            sessionId?: string;
            code?: string;
            clubId?: string;
            leaderboardId?: string;
            inviteId?: string;
        };
        const { sessionId, code, clubId, leaderboardId, inviteId } = body;

        if (!sessionId || !code) {
            return NextResponse.json(
                { error: 'sessionId and code are required.' },
                { status: 400 },
            );
        }

        const { email, token, username } = await puppeteerSessionManager.submitCode(sessionId, code);

        if (!email || !token || !username) {
            throw new Error('Missing required user information from Nike authentication.');
        }

        const user = await authService.findOrCreateUser({
            type: 'NRC',
            email,
            token,
            fullname: username,
        });

        if (!user) {
            throw new Error('User authentication failed.');
        }

        // --- Handle Club/Leaderboard Joining ---
        if (clubId && inviteId) {
            const existingMember = await db.userClub.findUnique({
                where: { userId_clubId: { userId: user.id, clubId } },
            });

            if (!existingMember) {
                const club = await db.club.findUnique({
                    where: { id: clubId },
                    select: { createdById: true, name: true },
                });
                await db.$transaction([
                    db.userClub.create({
                        data: { userId: user.id, clubId, role: 'MEMBER', isActive: true },
                    }),
                    db.notification.create({
                        data: {
                            userId: club?.createdById ?? '',
                            message: `${user.fullname} joined your club ${club?.name}`,
                            type: 'info',
                        },
                    }),
                    db.club.update({
                        where: { id: clubId },
                        data: { memberCount: { increment: 1 } },
                    }),
                    db.clubInvites.delete({ where: { id: inviteId } }),
                ]);
            }
        }

        if (leaderboardId && inviteId) {
            const existingEntry = await db.userLeaderboard.findUnique({
                where: { userId_leaderboardId: { userId: user.id, leaderboardId } },
            });

            if (!existingEntry) {
                const leaderboard = await db.leaderboard.findUnique({
                    where: { id: leaderboardId },
                    select: { createdById: true, name: true },
                });
                await db.$transaction([
                    db.userLeaderboard.create({ data: { userId: user.id, leaderboardId } }),
                    db.notification.create({
                        data: {
                            userId: leaderboard?.createdById ?? '',
                            message: `${user.fullname} joined your leaderboard ${leaderboard?.name}`,
                            type: 'info',
                        },
                    }),
                    db.leaderboardInvites.delete({ where: { id: inviteId } }),
                ]);
            }
        }

        // --- Establish Session ---
        const jwtPayload = { uid: user.id, email: user.email };
        const jwtExpirationTimeInSec = 1 * 60 * 60 * 24; // 24 Hours
        const expiresAt = moment().add(jwtExpirationTimeInSec, 'seconds').toISOString();

        const auth_token = jwt.sign(jwtPayload, process.env.AUTH_SECRET!, {
            expiresIn: jwtExpirationTimeInSec,
        });

        await signIn('credentials', {
            userId: user.id,
            redirect: false,
            token: auth_token,
            image: user.avatar,
        });

        const responsePayload = {
            status: 201,
            data: {
                ...user,
                token: auth_token,
                expiresAt,
            },
            action: (clubId || leaderboardId) ? 'redirect' : undefined,
            url: clubId ? `/clubs/${clubId}` : leaderboardId ? `/leaderboards/${leaderboardId}` : undefined,
        };

        return NextResponse.json(responsePayload, { status: 201 });
    } catch (err: any) {
        console.error('[/api/nrc/code]', err.message);
        if (err.statusCode) throw err;
        return NextResponse.json(
            { error: `An error occurred while logging in: ${err.message}` },
            { status: 500 }
        );
    }
}