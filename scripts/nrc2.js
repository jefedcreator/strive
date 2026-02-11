import puppeteer from 'puppeteer';
import axios from 'axios';
import promptSync from 'prompt-sync';
import { log } from 'console';

const prompt = promptSync({ sigint: true });

/**
 * Fetches user profile details using the Bearer Token
 */
async function fetchUserProfile(token) {
    console.log('👤 Fetching user profile details...');
    try {
        const response = await axios.get('https://api.nike.com/membership/v1/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const profile = response.data;
        
        console.log('\n--- USER PROFILE ---');
        console.log(`First Name: ${profile.first_name || 'N/A'}`);
        console.log(`Last Name:  ${profile.last_name || 'N/A'}`);
        console.log(`Email:      ${profile.email || 'N/A'}`);
        console.log(`Screen Name: ${profile.screen_name || 'N/A'}`);
        console.log('--------------------\n');
        
        return profile;
    } catch (error) {
        console.error('❌ Error fetching user profile:', error.response ? error.response.data : error.message);
    }
}

async function fetchRuns(token) {
    if (!token) return;

    console.log('🏃 Fetching run data...');
    try {
        const response = await axios.get(CONFIG.ACTIVITY_LIST_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('response',response.data);
        

        const activities = response.data.activities;
        
        console.log(`\n🎉 Found ${activities.length} activities:\n`);
        
        activities.forEach((activity, index) => {
            if (activity.type === 'run') {
                const summary = activity.summaries.find(s => s.metric === 'distance');
                const distance = summary ? (summary.value).toFixed(2) + ' km' : 'N/A';
                const duration = (activity.active_duration_ms / 60000).toFixed(2) + ' mins';
                const date = new Date(activity.start_epoch_ms).toLocaleDateString();
                
                console.log(`${index + 1}. [${date}] - Distance: ${distance} | Duration: ${duration} | ID: ${activity.id}`);
            }
        });

    } catch (error) {
        console.error('❌ Error fetching API data:', error.response ? error.response.data : error.message);
    }
}


// Update the Main Execution block:
(async () => {
    // const email = prompt('Enter Nike Email: ');
    // const password = prompt.hide('Enter Nike Password: ');

    // const creds = await getNikeCredentials(email, password);
    const token ="eyJhbGciOiJSUzI1NiIsImtpZCI6ImIyNmRlNzc5LTQyY2MtNDU5ZS05OWY0LTczOGE2MDQyZmJlM3NpZyJ9.eyJpYXQiOjE3NzA3MjkwNzAsImV4cCI6MTc3MDczMjY3MCwiaXNzIjoib2F1dGgyYWNjIiwianRpIjoiNjY3N2RmNGQtNGNmZS00OGU5LTlkN2UtZGFjNGViMThhYzA5IiwiYXVkIjoiY29tLm5pa2UuZGlnaXRhbCIsInNidCI6Im5pa2U6YXBwIiwidHJ1c3QiOjEwMCwibGF0IjoxNzcwNzI5MDYxLCJzY3AiOlsibmlrZS5kaWdpdGFsIl0sInN1YiI6ImNvbS5uaWtlLmNvbW1lcmNlLm5pa2Vkb3Rjb20ud2ViIiwicHJuIjoiZTMxOTRiOTItMDRjNi00MjVkLWI1NDItOTA2ZTc5MjI1MDNjIiwicHJ0IjoibmlrZTpwbHVzIiwibHJzY3AiOiJvcGVuaWQgbmlrZS5kaWdpdGFsIHByb2ZpbGUgZW1haWwgcGhvbmUgZmxvdyBjb3VudHJ5IiwibHJpc3MiOiJodHRwczovL2FjY291bnRzLm5pa2UuY29tIn0.RlJI-IoOO8FiWAO9biC0o3HvBt4Ca-n40JPAmIBp71i2X9dvDd3v4s5Ai_nGoP-II_-eCHN9Ddky6YZYPyYxg8BA_v_efCPkwPViZzcriG2n3lSuFp4fTtsoMla5VZmgk-QGKYWGI-X7SzS7RtX1Bi6TCbn-0Ix_RcDZ9qYU0hFpDrGkW_4Y0B8IU9fGwXmOXQP0Ex05_e9NdVf8ufKZj9k5-hPwJaVS-L8hUFjW1nk0OuBF15L0RgjIEeqFCFIpjIyr4Q24huQMKPRR1gdpQp_u4bopXKaqAZm7lZYnNNJ8OZN46rwwgL4x5dx5-eh0bSgpNZN9r_AtD-j8vpjQuA"

    if (token) {
        // Log user details using the Bearer Token
        await fetchUserProfile(token);
        
        // Then fetch the runs
        await fetchRuns(token);
    } else {
        console.log('❌ Auth failed.');
    }
})();