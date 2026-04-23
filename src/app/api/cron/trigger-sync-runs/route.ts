import { withMiddleware } from '@/backend/middleware';
import { syncAllUserRuns } from '@/backend/cron/sync-runs';
import { NextResponse } from 'next/server';

// This endpoint is purposefully exposed to allow us to manually
// trigger the run sync cron behavior, specifically for testing.
export const POST = withMiddleware(async (request) => {
  // Basic authorization to prevent public spamming.
  // if (env.NODE_ENV !== 'development') {
  //   const authHeader = request.headers.get('authorization');
  //   if (authHeader !== `Bearer ${env.AUTH_SECRET}`) {
  //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  //   }
  // }

  console.log(`Starting run sync for all users...`);

  await syncAllUserRuns();

  return NextResponse.json({
    success: true,
    message: 'Run sync cron job manual trigger completed.',
  });
}, []);
