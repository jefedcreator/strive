export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./backend/cron/leaderboard-expiration');
  }
}
