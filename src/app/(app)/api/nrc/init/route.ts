import { puppeteerSessionManager } from '@/backend/services/puppeteer/session';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const sessionId = await puppeteerSessionManager.initSession({
            // headless: 'new',
        });

        return NextResponse.json({ sessionId });
    } catch (err: any) {
        console.error('[/api/nrc/init] Failed to initialize session:', err.message);
        return NextResponse.json(
            { error: 'Failed to initialize Nike login session.' },
            { status: 500 },
        );
    }
}
