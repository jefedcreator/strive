import { nrc } from '../src/backend/services/nrc';

async function main() {
  // Get CLI arguments, skipping the executor (node) and script path
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(
      'Usage: npx tsx scripts/log-nrc-user-runs.ts <userId> <accessToken>'
    );
    process.exit(1);
  }

  const userId = args[0];
  const accessToken = args[1];

  console.log(`🚀 Fetching runs for NRC user ${userId}...`);

  try {
    // Fetch runs using the NRC service
    const runs = await nrc.fetchRuns(accessToken);

    if (runs && runs.length > 0) {
      console.log(`✅ Success: Found ${runs.length} runs.`);
      console.log(JSON.stringify(runs, null, 2));
    } else {
      console.log('ℹ️ No runs found for this user.');
    }

    // Explicitly exit to avoid any hanging database connections or processes
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fetching NRC runs:', error);
    process.exit(1);
  }
}

main();
