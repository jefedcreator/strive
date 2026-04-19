import axios from 'axios';
import { type RunData } from '@/types';

const CONFIG = {
  ACTIVITY_LIST_URL: 'https://api.nike.com/plus/v3/activities/before_id/v3',
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
  paging?: {
    before_id: string;
    next: string;
  };
}

class NRC {
  private buildActivitiesUrl(limit: number, beforeId = '*'): string {
    return `${CONFIG.ACTIVITY_LIST_URL}/${beforeId}?types=run%2Cjogging&include_deleted=false&limit=${limit}`;
  }

  public async fetchLatestRun(token: string): Promise<RunData | null> {
    const runs = await this.fetchRuns(token, 1);
    return runs[0] ?? null;
  }

  public async fetchRuns(token: string, limit = 1000): Promise<RunData[]> {
    if (!token) {
      console.log('No token provided.');
      return [];
    }

    let allRuns: RunData[] = [];
    let beforeId = '*';
    let hasMore = true;

    console.log('🏃 Fetching NRC run data...');

    try {
      while (hasMore && allRuns.length < limit) {
        // Fetch in batches of up to 100
        const batchLimit = Math.min(100, limit - allRuns.length);
        const url = this.buildActivitiesUrl(batchLimit, beforeId);

        const { data } = await axios.get<ActivitiesResponse>(url, {
          headers: {
            Authorization: token,
          },
        });

        const { activities, paging } = data;

        if (!activities || activities.length === 0) {
          hasMore = false;
          break;
        }

        const processedBatch = this.processActivities(activities);
        allRuns = [...allRuns, ...processedBatch];

        // Update beforeId for the next page
        if (paging?.before_id && paging.before_id !== beforeId) {
          beforeId = paging.before_id;
        } else {
          // If no paging info or it hasn't changed, we've reached the end
          hasMore = false;
        }

        if (allRuns.length >= limit) {
          hasMore = false;
        }
      }

      console.log(`\n🎉 Processed ${allRuns.length} total runs.\n`);
      return allRuns;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          throw new Error(`NRC authentication failed (${status})`);
        }
        console.error(
          '❌ Error fetching API data:',
          error.response ? error.response.data : error.message
        );
      } else {
        console.error('❌ An unexpected error occurred:', error);
      }
      return allRuns; // Return whatever we managed to fetch
    }
  }

  private processActivities(activities: Activity[]): RunData[] {
    const runs: RunData[] = [];

    activities.forEach((activity) => {
      if (activity.type === 'run') {
        const distanceSummary = activity.summaries.find(
          (s) => s.metric === 'distance'
        );
        const distance = distanceSummary ? distanceSummary.value : 0;
        const durationInMinutes = activity.active_duration_ms / 60000;
        const date = new Date(activity.start_epoch_ms).toISOString();

        // Calculate pace: min/km
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

    return runs;
  }
}
export const nrc = new NRC();
