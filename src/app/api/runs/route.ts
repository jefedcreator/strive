import { authMiddleware, withMiddleware } from '@/backend/middleware';
import type { AuthRequest } from '@/backend/middleware/types';
import { nrc } from '@/backend/services/nrc';
import { stravaService } from '@/backend/services/strava';
import { processRunsForUser } from '@/backend/services/runs';
import { type ApiResponse, type RunData } from '@/types';

/**
 * @bodyDescription Get user's runs from connected platforms. Supports Nike Run Club (NRC) and Strava activities
 */
export const GET = withMiddleware(
  async (request: AuthRequest) => {
    const user = request.user!;
    let runs: RunData[] = [];

    if (user.type === 'NRC') {
      const latestRun = await nrc.fetchLatestRun(user.access_token ?? '');
      runs = latestRun ? [latestRun] : [];
    } else if (user.type === 'STRAVA') {
      const latestRun = await stravaService.fetchLatestRun(user.access_token ?? '');
      runs = latestRun ? [latestRun] : [];
    }
    // Process runs: deduplicate, update leaderboards, check milestones, sync XP
    runs = await processRunsForUser(user.id, runs);

    const response: ApiResponse<RunData[]> = {
      status: 200,
      message: 'Runs retrieved successfully',
      data: runs,
    };

    return Response.json(response);
  },
  [authMiddleware]
);
