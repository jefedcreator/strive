import { NextResponse } from 'next/server';
import { syncAllUserRuns } from '@/backend/cron/sync-runs';
import { env } from '@/env';

// This endpoint is purposefully exposed to allow us to manually
// trigger the run sync cron behavior, specifically for testing.
export async function POST(request: Request) {
  try {
    // Basic authorization to prevent public spamming.
    // if (env.NODE_ENV !== 'development') {
    //   const authHeader = request.headers.get('authorization');
    //   if (authHeader !== `Bearer ${env.AUTH_SECRET}`) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    //   }
    // }

    await syncAllUserRuns();
    
    return NextResponse.json({ success: true, message: 'Run sync cron job manual trigger completed.' });
  } catch (error) {
    console.error('Error triggering manual run sync cron job:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
