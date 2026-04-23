import { withMiddleware } from '@/backend/middleware';
import { sseService } from '@/backend/services/events';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export const GET = withMiddleware(async (request, { params }) => {
  const { sessionId } = params;

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
}, []);
