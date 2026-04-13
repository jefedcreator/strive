import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = '698dd9a66281635d46e81f36';
  const count = 40;

  console.log(
    `Starting generation of ${count} private leaderboards for user ${userId}...`
  );

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error(`Error: User with ID ${userId} not found.`);
      return;
    }

    console.log(`User found: ${user.fullname} (${user.email})`);

    for (let i = 1; i <= count; i++) {
      const name = `Private Leaderboard ${i} - ${Math.random().toString(36).substring(7)}`;

      await prisma.$transaction(async (tx) => {
        const leaderboard = await tx.leaderboard.create({
          data: {
            name,
            description: `Generated private leaderboard #${i}`,
            isPublic: false,
            isActive: true,
            createdBy: {
              connect: { id: userId },
            },
          },
        });

        await tx.userLeaderboard.create({
          data: {
            userId,
            leaderboardId: leaderboard.id,
          },
        });

        console.log(`[${i}/${count}] Created: ${name} (ID: ${leaderboard.id})`);
      });
    }

    console.log(`\nSuccessfully created ${count} private leaderboards.`);
  } catch (error) {
    console.error('Error during generation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
