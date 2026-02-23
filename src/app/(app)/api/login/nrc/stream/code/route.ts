// src/app/api/nrc/code/route.ts
//
// Receives the OTP / verification code from the code modal and passes it to
// Puppeteer to complete the login. Returns the final NikeAuthResult.

import { puppeteerSessionManager } from '@/backend/services/puppeteer/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const body = await req.json() as { sessionId?: string; code?: string };
    const { sessionId, code } = body;

    if (!sessionId || !code) {
        return NextResponse.json(
            { error: 'sessionId and code are required.' },
            { status: 400 },
        );
    }

    try {
        const result = await puppeteerSessionManager.submitCode(sessionId, code);
        return NextResponse.json(result);
    } catch (err: any) {
        console.error('[/api/nrc/code]', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}