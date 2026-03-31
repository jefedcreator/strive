import cron from 'node-cron';
import { db } from '@/server/db';
import { stravaService } from '../services/strava';
import { nrc } from '../services/nrc';
import { processRunsForUser } from '../services/runs/process-runs';
import { emailService } from '../services/email';

const LOG_PREFIX = '[Cron:SyncRuns]';

/**
 * Attempt to get a valid Strava access token for a user.
 * Refreshes the token if it's expired or about to expire (within 5 minutes).
 * Returns the valid access token, or null if refresh fails.
 */
async function getValidStravaToken(
  user: { id: string; access_token: string | null; refresh_token: string | null; token_expires_at: number | null }
): Promise<string | null> {
  if (!user.access_token || !user.refresh_token) {
    console.warn(`${LOG_PREFIX} User ${user.id} missing Strava tokens.`);
    return null;
  }

  const nowUnix = Math.floor(Date.now() / 1000);

  // If token_expires_at is set and token is still valid (more than 5 min remaining), use it
  if (user.token_expires_at && nowUnix < user.token_expires_at - 300) {
    return user.access_token;
  }

  // Token is expired or about to expire — refresh it
  console.log(`${LOG_PREFIX} Refreshing Strava token for user ${user.id}...`);
  try {
    const { auth } = await stravaService.refreshAccessToken(user.refresh_token);

    await db.user.update({
      where: { id: user.id },
      data: {
        access_token: auth.accessToken,
        refresh_token: auth.refreshToken,
        token_expires_at: auth.expiresAt,
      },
    });

    console.log(`${LOG_PREFIX} Token refreshed for user ${user.id}.`);
    return auth.accessToken;
  } catch (error) {
    console.error(`${LOG_PREFIX} Failed to refresh Strava token for user ${user.id}:`, error);
    return null;
  }
}

/**
 * Main sync function — iterates over all users and fetches their latest runs.
 */
export const syncAllUserRuns = async () => {
  try {
    console.log(`${LOG_PREFIX} Starting run sync for all users...`);

    const users = await db.user.findMany({
      where: {
        access_token: { not: null },
      },
      select: {
        id: true,
        email: true,
        fullname: true,
        type: true,
        access_token: true,
        refresh_token: true,
        token_expires_at: true,
      },
    });

    console.log(`${LOG_PREFIX} Found ${users.length} users to sync.`);

    let synced = 0;
    let failed = 0;

    for (const user of users) {
      try {
        if (user.type === 'STRAVA') {
          await syncStravaUser(user);
          synced++;
        } else if (user.type === 'NRC') {
          await syncNRCUser(user);
          synced++;
        }
      } catch (error) {
        failed++;
        console.error(`${LOG_PREFIX} Error syncing user ${user.id}:`, error);
      }
    }

    console.log(`${LOG_PREFIX} Finished. Synced: ${synced}, Failed: ${failed}`);
  } catch (error) {
    console.error(`${LOG_PREFIX} Fatal error in syncAllUserRuns:`, error);
  }
};

/**
 * Sync runs for a Strava user.
 * Refreshes token if needed, fetches runs, and processes them.
 */
async function syncStravaUser(user: {
  id: string;
  email: string;
  fullname: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: number | null;
}) {
  const token = await getValidStravaToken(user);

  if (!token) {
    // Token refresh failed — notify user to re-authenticate
    console.warn(`${LOG_PREFIX} Strava re-auth required for user ${user.id}.`);
    await notifyReAuth(user, 'Strava');
    return;
  }

  const runs = await stravaService.fetchAllActivities(token);
  console.log(`${LOG_PREFIX} Strava: Fetched ${runs.length} runs for user ${user.id}.`);

  if (runs.length > 0) {
    await processRunsForUser(user.id, runs);
  }

  await db.user.update({
    where: { id: user.id },
    data: { lastSyncAt: new Date() },
  });
}

/**
 * Sync runs for an NRC user.
 * Always attempts to fetch — sends re-auth email only on failure.
 */
async function syncNRCUser(user: {
  id: string;
  email: string;
  fullname: string;
  access_token: string | null;
}) {
  if (!user.access_token) {
    console.warn(`${LOG_PREFIX} NRC user ${user.id} has no access token.`);
    await notifyReAuth(user, 'Nike Run Club');
    return;
  }

  try {
    const runs = await nrc.fetchRuns(user.access_token);

    if (runs.length === 0) {
      // Empty response could mean expired token or genuinely no runs.
      // We don't send re-auth here — only on actual failures.
      console.log(`${LOG_PREFIX} NRC: No runs returned for user ${user.id}.`);
    } else {
      console.log(`${LOG_PREFIX} NRC: Fetched ${runs.length} runs for user ${user.id}.`);
      await processRunsForUser(user.id, runs);
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastSyncAt: new Date() },
    });
  } catch (error) {
    // Fetch failed — token is likely expired
    console.error(`${LOG_PREFIX} NRC fetch failed for user ${user.id}:`, error);
    await notifyReAuth(user, 'Nike Run Club');
  }
}

/**
 * Send a re-authentication email and create an in-app notification.
 */
async function notifyReAuth(
  user: { id: string; email: string; fullname: string },
  provider: string
) {
  try {
    // Send email
    if (user.email) {
      await emailService.sendReAuthEmail(user.email, provider, user.fullname);
    }

    // Create in-app notification
    await db.notification.create({
      data: {
        userId: user.id,
        message: `Your ${provider} connection has expired. Please log in to continue syncing your runs.`,
        type: 'info',
      },
    });

    console.log(`${LOG_PREFIX} Re-auth notification sent to user ${user.id} (${provider}).`);
  } catch (error) {
    console.error(`${LOG_PREFIX} Failed to send re-auth notification for user ${user.id}:`, error);
  }
}

// Schedule job to run every 6 hours
cron.schedule('0 */6 * * *', () => {
  void syncAllUserRuns();
});
