import { authMiddleware, withMiddleware } from '@/backend/middleware';
import type { AuthRequest } from '@/backend/middleware/types';
import { nrc } from '@/backend/services/nrc';
import { stravaService } from '@/backend/services/strava';
import { type ApiResponse, type RunData } from '@/types';

/**
 * @bodyDescription Get user's runs from connected platforms. Supports Nike Run Club (NRC) and Strava activities
 */
export const GET = withMiddleware(
  async (request: AuthRequest) => {
    const user = request.user!;
    let runs: RunData[] = [];

    if (user.type === 'NRC') {
      runs = await nrc.fetchRuns(user.access_token ?? '');
    } else if (user.type === 'STRAVA') {
      runs = await stravaService.fetchAllActivities(user.access_token ?? '');
    }

    const response: ApiResponse<RunData[]> = {
      status: 200,
      message: 'Runs retrieved successfully',
      data: runs,
    };

    return Response.json(response);
  },
  [authMiddleware]
);
