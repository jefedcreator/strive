import axios from 'axios';

const CONFIG = {
    ACTIVITY_LIST_URL: 'https://api.nike.com/sport/v3/me/activities',
};

// Type definitions for the NRC API response
interface Summary {
    metric: 'distance' | 'pace' | 'speed' | 'calories';
    value: number;
}

interface Activity {
    id: string;
    type: 'run' | 'walk' | string; // It can be other types
    start_epoch_ms: number;
    active_duration_ms: number;
    summaries: Summary[];
}

interface ActivitiesResponse {
    activities: Activity[];
}

class NRC {
    public async fetchRuns(token: string): Promise<void> {
        if (!token) {
            console.log('No token provided.');
            return;
        }

        console.log('🏃 Fetching run data...');
        try {
            const { data } = await axios.get<ActivitiesResponse>(CONFIG.ACTIVITY_LIST_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const { activities } = data;

            console.log(`\n🎉 Found ${activities.length} activities:\n`);

            activities.forEach((activity, index) => {
                if (activity.type === 'run') {
                    const distanceSummary = activity.summaries.find(s => s.metric === 'distance');
                    const distance = distanceSummary ? `${distanceSummary.value.toFixed(2)} km` : 'N/A';
                    const duration = `${(activity.active_duration_ms / 60000).toFixed(2)} mins`;
                    const date = new Date(activity.start_epoch_ms).toLocaleDateString();

                    console.log(`${index + 1}. [${date}] - Distance: ${distance} | Duration: ${duration} | ID: ${activity.id}`);
                }
            });

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('❌ Error fetching API data:', error.response ? error.response.data : error.message);
            } else {
                 console.error('❌ An unexpected error occurred:', error);
            }
        }
    }
}

export const nrc = new NRC();