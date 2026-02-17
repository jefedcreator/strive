import axios from 'axios';

const CONFIG = {
  // ACTIVITY_LIST_URL: 'https://api.nike.com/sport/v3/me/activities',
  ACTIVITY_LIST_URL:
    'https://api.nike.com/plus/v3/activities/before_id/v3/*?limit=30&types=run%2Cjogging&include_deleted=false',
  URL: 'https://api.nike.com/plus/v3/activities/before_id/v3/*?limit=30&types=run%2Cjogging&include_deleted=false',
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

export interface RunData {
  id: string;
  date: string;
  distance: number; // in km
  duration: number; // in minutes
  pace: string; // in min/km
  type: string;
  name: string;
}

interface ActivitiesResponse {
  activities: Activity[];
}

class NRC {
  public async fetchRuns(token: string): Promise<RunData[]> {
    if (!token) {
      console.log('No token provided.');
      return [];
    }

    console.log('token', token);

    console.log('🏃 Fetching run data...');
    try {
      const { data } = await axios.get<ActivitiesResponse>(
        CONFIG.ACTIVITY_LIST_URL,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      const { activities } = data;
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
            type: activity.type,
            name: 'Nike Run Club Activity',
          });
        }
      });

      console.log(`\n🎉 Processed ${runs.length} runs.\n`);
      return runs;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          '❌ Error fetching API data:',
          error.response ? error.response.data : error.message
        );
      } else {
        console.error('❌ An unexpected error occurred:', error);
      }
      return [];
    }
  }
}
export const nrc = new NRC();
