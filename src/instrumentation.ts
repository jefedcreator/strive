import * as Sentry from '@sentry/nextjs';

export const onRequestError = Sentry.captureRequestError;

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./backend/cron/leaderboard-expiration');
    await import('./backend/cron/sync-runs');
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}
