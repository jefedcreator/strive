// src/app/api/nrc/email/route.ts
//
// Receives the email the user typed in the modal and passes it to Puppeteer.
// Puppeteer types it into #username, clicks Continue, then emits 'login-code'
// via SSE to open the code modal on the client.

import { bodyValidatorMiddleware, withMiddleware } from '@/backend/middleware';
import { puppeteerSessionManager } from '@/backend/services/puppeteer/session';
import {
  nrcEmailValidatorSchema,
  type NrcEmailValidatorSchema,
} from '@/backend/validators/auth.validator';
import { NextResponse } from 'next/server';

export const POST = withMiddleware<NrcEmailValidatorSchema>(
  async (request) => {
    try {
      const { sessionId, email } = request.validatedData!;
      console.log('sessionId', sessionId);
      console.log('email', email);

      // Fire-and-forget: the client is listening for the SSE 'login-code'
      // event rather than waiting on this HTTP response.
      void puppeteerSessionManager.submitEmail(sessionId, email);

      return NextResponse.json({ ok: true });
    } catch (err: any) {
      console.error('[/api/nrc/email]', err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  },
  [bodyValidatorMiddleware(nrcEmailValidatorSchema)]
);
