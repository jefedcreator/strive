import { authMiddleware, withMiddleware } from '@/backend/middleware';
import type { AuthRequest } from '@/backend/middleware/types';
import { nrc } from '@/backend/services/nrc';
import { stravaService } from '@/backend/services/strava';

/**
 * @bodyDescription Get user's runs from connected platforms. Supports Nike Run Club (NRC) and Strava activities
 */
export const GET = withMiddleware(
  async (request: AuthRequest) => {
    const user = request.user!;
    let runs = [];

    if (user.type === 'NRC') {
      runs = await nrc.fetchRuns(user.access_token ?? '');
    } else if (user.type === 'STRAVA') {
      runs = await stravaService.fetchAllActivities(user.access_token ?? '');
    }

    return Response.json({
      status: 200,
      data: runs,
    });
  },
  [authMiddleware]
);
