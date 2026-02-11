import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// import puppeteer from 'puppeteer';
import axios from 'axios';
import promptSync from 'prompt-sync';
import puppeteer from 'puppeteer-extra';

const prompt = promptSync({ sigint: true });
// Enable Stealth
// puppeteer.use(StealthPlugin());
puppeteer.use(StealthPlugin());

const CONFIG = {
    // Using the main login URL often helps establish a more reliable session than the direct mobile link
    LOGIN_URL: "https://www.nike.com/login",
    ACTIVITY_URL: "https://api.nike.com/plus/v3/activities/before_id/v3/*?limit=30&types=run%2Cjogging&include_deleted=false",
    PROFILE_URL: "https://api.nike.com/membership/v1/profile",
    USER_AGENT: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
};

async function getNikeCredentials(email, password) {
    console.log('🚀 Launching stealth browser...');
    
    const browser = await puppeteer.launch({ 
        headless: false, // Keep false to bypass initial bot checks
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent(CONFIG.USER_AGENT);

    let accessToken = null;

    // Intercept the token from background XHR requests
    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('unite.nike.com/login') || url.includes('token')) {
            try {
                const body = await response.json();
                if (body.access_token) {
                    accessToken = body.access_token;
                    console.log('✅ Access Token Captured.');
                }
            } catch (e) { /* Ignore non-JSON responses */ }
        }
    });

    try {
        console.log('🌐 Navigating to Nike...');
        await page.goto(CONFIG.LOGIN_URL, { waitUntil: 'networkidle2' });

        if (email && password) {
            console.log('⌨️  Filling credentials...');
            await page.waitForSelector('input[type="email"]', { timeout: 15000 });
            await page.type('input[type="email"]', email, { delay: 100 });
            
            // Note: Nike's login UI changes frequently. If these selectors fail, 
            // the script will fall back to manual login while the browser is open.
            try {
                await page.click('button[type="submit"]'); // Click "Continue"
                await page.waitForSelector('input[type="password"]', { timeout: 5000 });
                await page.type('input[type="password"]', password, { delay: 100 });
                await page.click('button[type="submit"]'); // Click "Sign In"
            } catch (err) {
                console.log('⚠️  Automation slowed by UI; please complete the login manually in the browser.');
            }
        }

        // Wait for token capture
        let waitCount = 0;
        while (!accessToken && waitCount < 120) { // 60 second timeout
            await new Promise(r => setTimeout(r, 500));
            waitCount++;
        }

    } catch (error) {
        console.error('❌ Error during login phase:', error.message);
    } finally {
        await browser.close();
    }
    return accessToken;
}

/**
 * Enhanced Fetcher with Human-like Headers
 */
async function authenticatedRequest(url, token) {
    return axios.get(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': CONFIG.USER_AGENT,
            'Origin': 'https://www.nike.com',
            'Referer': 'https://www.nike.com/',
            'Accept': 'application/json'
        }
    });
}

(async () => {
    console.log("--- Nike NRC Stealth Exporter ---");
    // const email = prompt('Email: ');
    // const password = prompt.hide('Password: ');

    // const token = await getNikeCredentials(email, password);
    const token ="eyJhbGciOiJSUzI1NiIsImtpZCI6ImIyNmRlNzc5LTQyY2MtNDU5ZS05OWY0LTczOGE2MDQyZmJlM3NpZyJ9.eyJpYXQiOjE3NzA3MjkwNzAsImV4cCI6MTc3MDczMjY3MCwiaXNzIjoib2F1dGgyYWNjIiwianRpIjoiNjY3N2RmNGQtNGNmZS00OGU5LTlkN2UtZGFjNGViMThhYzA5IiwiYXVkIjoiY29tLm5pa2UuZGlnaXRhbCIsInNidCI6Im5pa2U6YXBwIiwidHJ1c3QiOjEwMCwibGF0IjoxNzcwNzI5MDYxLCJzY3AiOlsibmlrZS5kaWdpdGFsIl0sInN1YiI6ImNvbS5uaWtlLmNvbW1lcmNlLm5pa2Vkb3Rjb20ud2ViIiwicHJuIjoiZTMxOTRiOTItMDRjNi00MjVkLWI1NDItOTA2ZTc5MjI1MDNjIiwicHJ0IjoibmlrZTpwbHVzIiwibHJzY3AiOiJvcGVuaWQgbmlrZS5kaWdpdGFsIHByb2ZpbGUgZW1haWwgcGhvbmUgZmxvdyBjb3VudHJ5IiwibHJpc3MiOiJodHRwczovL2FjY291bnRzLm5pa2UuY29tIn0.RlJI-IoOO8FiWAO9biC0o3HvBt4Ca-n40JPAmIBp71i2X9dvDd3v4s5Ai_nGoP-II_-eCHN9Ddky6YZYPyYxg8BA_v_efCPkwPViZzcriG2n3lSuFp4fTtsoMla5VZmgk-QGKYWGI-X7SzS7RtX1Bi6TCbn-0Ix_RcDZ9qYU0hFpDrGkW_4Y0B8IU9fGwXmOXQP0Ex05_e9NdVf8ufKZj9k5-hPwJaVS-L8hUFjW1nk0OuBF15L0RgjIEeqFCFIpjIyr4Q24huQMKPRR1gdpQp_u4bopXKaqAZm7lZYnNNJ8OZN46rwwgL4x5dx5-eh0bSgpNZN9r_AtD-j8vpjQuA"

    if (token) {
        try {
            // 1. Log User Details
            // const profileRes = await authenticatedRequest(CONFIG.PROFILE_URL, token);
            // const p = profileRes.data;
            // console.log(`\n👤 User: ${p.first_name} ${p.last_name} (${p.email})`);
            // console.log(`🆔 Nike ID: ${p.upm_id}\n`);

            // 2. Log Run Data
            const runRes = await authenticatedRequest(CONFIG.ACTIVITY_URL, token);
            const runs = runRes.data.activities;
            console.log(`🏃 Recent Runs:`);
            runs.slice(0, 5).forEach(r => {
                const dist = r.summaries.find(s => s.metric === 'distance')?.value.toFixed(2) || 0;
                console.log(` - ${new Date(r.start_epoch_ms).toLocaleDateString()}: ${dist} km`);
            });

        } catch (err) {
            console.error('❌ API Error:', err.response?.status === 403 ? "Forbidden (Bot Detection)" : err.message);
        }
    } else {
        console.log('❌ Failed to capture token. Check your credentials or internet connection.');
    }
})();