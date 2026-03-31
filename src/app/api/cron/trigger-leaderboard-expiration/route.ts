import { NextResponse } from 'next/server';
import { processExpiredLeaderboards } from '@/backend/cron/leaderboard-expiration';
import { env } from '@/env';

// This endpoint is purposefully exposed to allow us to manually
// trigger the cron behavior, specifically for testing without waiting for midnight.
export async function POST(request: Request) {
  try {
    // Basic authorization to prevent public spamming.
    // Replace logic here if there is a specific CRON_SECRET being used.
    // We will just allow it in development.
    if (env.NODE_ENV !== 'development') {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${env.AUTH_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    await processExpiredLeaderboards();
    
    return NextResponse.json({ success: true, message: 'Cron job manual trigger completed.' });
  } catch (error) {
    console.error('Error triggering manual cron job:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
