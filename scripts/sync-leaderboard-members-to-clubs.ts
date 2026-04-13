import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting sync of leaderboard members to clubs...');

    try {
        // 1. Fetch all leaderboards that are linked to a club
        const leaderboards = await prisma.leaderboard.findMany({
            where: {
                clubId: { not: null },
            },
            include: {
                club: true,
                entries: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        console.log(`Found ${leaderboards.length} leaderboards linked to clubs.`);

        let totalAdded = 0;

        for (const leaderboard of leaderboards) {
            const clubId = leaderboard.clubId!;
            const clubName = leaderboard.club?.name || 'Unknown Club';
            const userIds = leaderboard.entries.map((entry) => entry.userId);

            console.log(`\nProcessing leaderboard "${leaderboard.name}" (Club: ${clubName})`);
            console.log(`Found ${userIds.length} members in the leaderboard.`);

            for (const userId of userIds) {
                // Check if user is already a member of the club
                const existingMembership = await prisma.userClub.findUnique({
                    where: {
                        userId_clubId: {
                            userId,
                            clubId,
                        },
                    },
                });

                if (!existingMembership) {
                    try {
                        await prisma.$transaction(async (tx) => {
                            // Re-check inside transaction for safety
                            const stillMissing = await tx.userClub.findFirst({
                                where: {
                                    userId,
                                    clubId,
                                },
                            });

                            if (!stillMissing) {
                                await tx.userClub.create({
                                    data: {
                                        userId,
                                        clubId,
                                        role: 'MEMBER',
                                    },
                                });

                                await tx.club.update({
                                    where: { id: clubId },
                                    data: { memberCount: { increment: 1 } },
                                });

                                console.log(`  + Added user ${userId} to club ${clubName}`);
                                totalAdded++;
                            }
                        });
                    } catch (txError: any) {
                        console.error(`  ! Failed to add user ${userId} to club ${clubId}:`, txError.message);
                    }
                } else {
                    // console.log(`  - User ${userId} is already a member of ${clubName}`);
                }
            }
        }

        console.log(`\nSync completed. Total users added to clubs: ${totalAdded}`);
    } catch (error) {
        console.error('Fatal error during sync:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
