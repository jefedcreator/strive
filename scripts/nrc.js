import puppeteer from 'puppeteer';
import axios from 'axios';
import promptSync from 'prompt-sync';

const prompt = promptSync({ sigint: true });

"mb6.q%ZF.DeW_LN"

"https://accounts.nike.com/lookup?client_id=4fd2d5e7db76e0f85a6bb56721bd51df&redirect_uri=https://www.nike.com/auth/login&response_type=code&scope=openid%20nike.digital%20profile%20email%20phone%20flow%20country&state=f70d9fe3bd5845b091acca1efde3b0e3&ui_locales=en-SE&code_challenge=Mj3lfHUoEGDeJAnCTzzOH3uRu9FyxgDOk2yl2Y6TAFI&code_challenge_method=S256"
    LOGIN_URL= "https://www.nike.com/se/en/nrc-app", // URL used in Python script

// Configuration from the Python script
const CONFIG = {
    // LOGIN_URL: "https://www.nike.com/in/launch?s=in-stock", // URL used in Python script
    LOGIN_URL:"https://accounts.nike.com/lookup?client_id=4fd2d5e7db76e0f85a6bb56721bd51df&redirect_uri=https://www.nike.com/auth/login&response_type=code&scope=openid%20nike.digital%20profile%20email%20phone%20flow%20country&state=f70d9fe3bd5845b091acca1efde3b0e3&ui_locales=en-SE&code_challenge=Mj3lfHUoEGDeJAnCTzzOH3uRu9FyxgDOk2yl2Y6TAFI&code_challenge_method=S256",
    MOBILE_LOGIN_URL: "https://unite.nike.com/s3/unite/mobile.html?androidSDKVersion=3.1.0&corsoverride=https://unite.nike.com&uxid=com.nike.sport.running.droid.3.8&locale=en_US&backendEnvironment=identity&view=login&clientId=WLr1eIG5JSNNcBJM3npVa6L76MK8OBTt&facebookAppId=84697719333&wechatAppId=wxde7d0246cfaf32f7",
    ACTIVITY_LIST_URL: "https://api.nike.com/plus/v3/activities/before_id/v3/*?limit=30&types=run%2Cjogging&include_deleted=false",
    // Selectors from the Python script (Note: These can be brittle if Nike updates their UI)
    SELECTORS: {
        LOGIN_BTN: "button.join-log-in, button[data-qa='join-login-button']", 
        EMAIL_INPUT: "input[name='credential']#username",
        NEXT_BUTTON:"button[aria-label='continue']",
        USE_PASSWORD_BUTTON:"button[aria-label='Use Password']",
        PASSWORD_INPUT: "input[name='password']#password",
        SUBMIT_BTN: "button[aria-label='Sign In']"
    }
};

async function getNikeAccessToken(email, password) {
    console.log('🚀 Launching browser to authenticate...');
    
    // Launch browser (Headless false so you can see/debug login)
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    let accessToken = null;

    // 1. Setup Network Interception (Equivalent to Python's extraction logic)
    // We listen for any response that looks like a login response containing the token
    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('login') || url.includes('token')) {
            try {
                const reqHeaders = response.request().headers();
                const contentType = response.headers()['content-type'];
                
                if (contentType && contentType.includes('application/json')) {
                    const body = await response.json();
                    if (body.access_token) {
                        accessToken = body.access_token;
                        console.log('✅ Access Token successfully intercepted!');
                    }
                }
            } catch (e) {
                // Ignore parsing errors for non-JSON responses
            }
        }
    });

    try {
        // 2. Navigate to Login Page
        console.log('🌐 Navigating to login page...');
        await page.goto(CONFIG.LOGIN_URL, { waitUntil: 'networkidle2' });

        // 3. Automate Login (or allow manual fallback)
        if (email && password) {
            console.log('⌨️  Attempting automated login...');
            
            // Wait for Email Input
            const emailInput = await page.waitForSelector(CONFIG.SELECTORS.EMAIL_INPUT, { timeout: 10000 });
            await emailInput.type(email, { delay: 50 });

            // Wait for Password Input
            const passwordInput = await page.waitForSelector(CONFIG.SELECTORS.PASSWORD_INPUT, { timeout: 5000 });
            await passwordInput.type(password, { delay: 50 });

            // Click Submit
            const submitBtn = await page.waitForSelector(CONFIG.SELECTORS.SUBMIT_BTN, { timeout: 5000 });
            await submitBtn.click();
            
            console.log('⏳ Credentials submitted. Waiting for token...');
        } else {
            console.log('⚠️  No credentials provided. Please log in manually in the browser window.');
        }

        // 4. Wait for the token to be captured
        const maxWaitTime = 60000; // 60 seconds
        const startTime = Date.now();
        
        while (!accessToken) {
            if (Date.now() - startTime > maxWaitTime) {
                throw new Error("Timeout waiting for access token.");
            }
            await new Promise(r => setTimeout(r, 500)); // Check every 500ms
        }

    } catch (error) {
        console.error('❌ Login failed or timed out:', error.message);
    } finally {
        await browser.close();
    }

    return accessToken;
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

// Main Execution
(async () => {
    console.log("--- Nike Run Club Exporter (Node.js) ---");
    console.log("Note: Logic based on https://github.com/yasoob/nrc-exporter");
    
    // const email = prompt('Enter Nike Email (leave empty for manual login): ');
    // let password = '';
    // if (email) {
    //     password = prompt.hide('Enter Nike Password: ');
    // }

    // const token = await getNikeAccessToken(email, password);
    const token ="eyJhbGciOiJSUzI1NiIsImtpZCI6ImIyNmRlNzc5LTQyY2MtNDU5ZS05OWY0LTczOGE2MDQyZmJlM3NpZyJ9.eyJpYXQiOjE3NzA3MjkwNzAsImV4cCI6MTc3MDczMjY3MCwiaXNzIjoib2F1dGgyYWNjIiwianRpIjoiNjY3N2RmNGQtNGNmZS00OGU5LTlkN2UtZGFjNGViMThhYzA5IiwiYXVkIjoiY29tLm5pa2UuZGlnaXRhbCIsInNidCI6Im5pa2U6YXBwIiwidHJ1c3QiOjEwMCwibGF0IjoxNzcwNzI5MDYxLCJzY3AiOlsibmlrZS5kaWdpdGFsIl0sInN1YiI6ImNvbS5uaWtlLmNvbW1lcmNlLm5pa2Vkb3Rjb20ud2ViIiwicHJuIjoiZTMxOTRiOTItMDRjNi00MjVkLWI1NDItOTA2ZTc5MjI1MDNjIiwicHJ0IjoibmlrZTpwbHVzIiwibHJzY3AiOiJvcGVuaWQgbmlrZS5kaWdpdGFsIHByb2ZpbGUgZW1haWwgcGhvbmUgZmxvdyBjb3VudHJ5IiwibHJpc3MiOiJodHRwczovL2FjY291bnRzLm5pa2UuY29tIn0.RlJI-IoOO8FiWAO9biC0o3HvBt4Ca-n40JPAmIBp71i2X9dvDd3v4s5Ai_nGoP-II_-eCHN9Ddky6YZYPyYxg8BA_v_efCPkwPViZzcriG2n3lSuFp4fTtsoMla5VZmgk-QGKYWGI-X7SzS7RtX1Bi6TCbn-0Ix_RcDZ9qYU0hFpDrGkW_4Y0B8IU9fGwXmOXQP0Ex05_e9NdVf8ufKZj9k5-hPwJaVS-L8hUFjW1nk0OuBF15L0RgjIEeqFCFIpjIyr4Q24huQMKPRR1gdpQp_u4bopXKaqAZm7lZYnNNJ8OZN46rwwgL4x5dx5-eh0bSgpNZN9r_AtD-j8vpjQuA"

    if (token) {
        await fetchRuns(token);
    } else {
        console.log('❌ Could not retrieve access token. Exiting.');
    }
})();
