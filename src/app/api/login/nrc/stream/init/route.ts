import { withMiddleware } from '@/backend/middleware';
import { puppeteerSessionManager } from '@/backend/services/puppeteer';
import { NextResponse } from 'next/server';

export const POST = withMiddleware(async () => {
  const sessionId = await puppeteerSessionManager.initSession({
    // headless: 'new',
    timeout: 600000,
  });

  return NextResponse.json(
    {
      status: 202,
      message: 'Nike authentication session initialized',
      sessionId,
    },
    { status: 202 }
  );
}, []);
