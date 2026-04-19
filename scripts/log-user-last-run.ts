import { stravaService } from '../src/backend/services/strava';

async function main() {
  // Get CLI arguments, skipping the executor (node) and script path
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(
      'Usage: npx tsx scripts/log-user-last-run.ts <userId> <accessToken>'
    );
    process.exit(1);
  }

  const userId = args[0];
  const accessToken = args[1];

  console.log(`🚀 Fetching latest run for user ${userId}...`);

  try {
    const latestRun = await stravaService.fetchLatestRun(accessToken, userId);

    if (latestRun) {
      console.log('✅ Latest Run Success:');
      console.log(JSON.stringify(latestRun, null, 2));
    } else {
      console.log('ℹ️ No runs found for this user.');
    }

    // Explicitly exit to avoid any hanging database connections (e.g. Prisma)
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fetching latest run:', error);
    process.exit(1);
  }
}

main();
