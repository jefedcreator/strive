import { withMiddleware } from '@/backend/middleware';
import { processExpiredLeaderboards } from '@/backend/cron/leaderboard-expiration';
import { env } from '@/env';
import { NextResponse } from 'next/server';

// This endpoint is purposefully exposed to allow us to manually
// trigger the cron behavior, specifically for testing without waiting for midnight.
export const POST = withMiddleware(async (request) => {
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

  return NextResponse.json({
    success: true,
    message: 'Cron job manual trigger completed.',
  });
}, []);
