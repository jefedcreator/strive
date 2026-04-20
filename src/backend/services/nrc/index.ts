import axios from 'axios';
import { type RunData } from '@/types';

const CONFIG = {
  // ACTIVITY_LIST_URL: 'https://api.nike.com/sport/v3/me/activities',
  ACTIVITY_LIST_URL:
    'https://api.nike.com/plus/v3/activities/before_id/v3/*?types=run%2Cjogging&include_deleted=false',
};

// Type definitions for the NRC API response
interface Summary {
  metric: 'distance' | 'pace' | 'speed' | 'calories';
  value: number;
}

interface Activity {
  id: string;
  type: 'run';
  start_epoch_ms: number;
  active_duration_ms: number;
  summaries: Summary[];
}

interface ActivitiesResponse {
  activities: Activity[];
}

class NRC {
  private buildActivitiesUrl(limit: number, beforeId = '*'): string {
    const baseUrl = CONFIG.ACTIVITY_LIST_URL.replace('before_id/v3/*', `before_id/v3/${beforeId}`);
    return `${baseUrl}&limit=${limit}`;
  }

  public async fetchLatestRun(token: string): Promise<RunData | null> {
    const runs = await this.fetchRuns(token, 1);
    return runs[0] ?? null;
  }

  public async fetchAllActivities(token: string): Promise<RunData[]> {
    let allRuns: RunData[] = [];
    let beforeId = '*';
    let hasMore = true;
    const limit = 30;

    while (hasMore) {
      const { runs, paging } = await this.fetchRunsWithPaging(token, limit, beforeId);
      if (runs.length === 0) {
        hasMore = false;
      } else {
        allRuns = [...allRuns, ...runs];
        beforeId = paging.before_id || "*";
        // If NRC provides no next before_id or we got fewer runs than requested, we might be at the end.
        // However, unofficial APIs are tricky. Often a null before_id or empty activities list is the best indicator.
        if (!beforeId || runs.length < limit) {
          hasMore = false;
        }
      }
    }

    return allRuns;
  }

  public async fetchRuns(token: string, limit = 30): Promise<RunData[]> {
    const { runs } = await this.fetchRunsWithPaging(token, limit);
    return runs;
  }

  private async fetchRunsWithPaging(
    token: string,
    limit = 30,
    beforeId = '*'
  ): Promise<{ runs: RunData[]; paging: { before_id: string | null } }> {
    if (!token) {
      console.log('No token provided.');
      return { runs: [], paging: { before_id: null } };
    }

    console.log('🏃 Fetching NRC run data...');
    try {
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const { data } = await axios.get<ActivitiesResponse & { paging?: { before_id: string } }>(
        this.buildActivitiesUrl(limit, beforeId),
        {
          headers: {
            Authorization: authToken,
          },
        }
      );

      const { activities, paging } = data;
      const runs: RunData[] = [];

      activities.forEach((activity) => {
        if (activity.type === 'run') {
          const distanceSummary = activity.summaries.find(
            (s) => s.metric === 'distance'
          );
          const distance = distanceSummary ? distanceSummary.value : 0;
          const durationInMinutes = activity.active_duration_ms / 60000;
          const date = new Date(activity.start_epoch_ms).toISOString();

          let pace = '0:00';
          if (distance > 0) {
            const totalSeconds = activity.active_duration_ms / 1000 / distance;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = Math.round(totalSeconds % 60);
            pace = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          }

          runs.push({
            id: activity.id,
            date,
            distance: parseFloat(distance.toFixed(2)),
            duration: parseFloat(durationInMinutes.toFixed(2)),
            pace,
            name: 'Nike Run Club Activity',
          });
        }
      });

      return {
        runs,
        paging: {
          before_id: paging?.before_id || (activities.length > 0 ? activities[activities.length - 1]!.id : null),
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          throw new Error(`NRC authentication failed (${status})`);
        }
        console.error(
          '❌ Error fetching NRC data:',
          error.response ? error.response.data : error.message
        );
      } else {
        console.error('❌ NRC fetch error:', error);
      }
      return { runs: [], paging: { before_id: null } };
    }
  }
}
export const nrc = new NRC();