// src/app/api/nrc/email/route.ts
//
// Receives the email the user typed in the modal and passes it to Puppeteer.
// Puppeteer types it into #username, clicks Continue, then emits 'login-code'
// via SSE to open the code modal on the client.

import { puppeteerSessionManager } from '@/backend/services/puppeteer/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { sessionId?: string; email?: string };
  const { sessionId, email } = body;
  console.log('sessionId', sessionId);
  console.log('email', email);

  if (!sessionId || !email) {
    return NextResponse.json(
      { error: 'sessionId and email are required.' },
      { status: 400 }
    );
  }

  try {
    // Fire-and-forget: the client is listening for the SSE 'login-code'
    // event rather than waiting on this HTTP response.
    void puppeteerSessionManager.submitEmail(sessionId, email);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[/api/nrc/email]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
