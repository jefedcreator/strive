import { NextResponse } from 'next/server';
import { puppeteerSessionManager } from '@/backend/services/puppeteer/session';

export const POST = async () => {
    try {
        const sessionId = await puppeteerSessionManager.initSession({
            headless: 'new', // Using new headless mode for stability
            timeout: 60000,
        });

        return NextResponse.json({
            status: 202,
            message: 'Nike authentication session initialized',
            sessionId,
        }, { status: 202 });
    } catch (error: any) {
        console.error('Failed to initialize NRC session', error);
        return NextResponse.json(
            { message: `Failed to initialize session: ${error.message}` },
            { status: 500 }
        );
    }
};
