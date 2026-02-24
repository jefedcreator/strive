// src/app/api/nrc/stream/[sessionId]/route.ts
//
// The client opens this endpoint with EventSource immediately after receiving
// a sessionId from POST /api/nrc/init. The stream stays open and pushes
// Puppeteer milestones (ready, processing, success, error) as SSE events.

import { sseService } from '@/backend/services/events';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json(
      { error: 'sessionId is required' },
      { status: 400 }
    );
  }

  const stream = sseService.register(sessionId);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
