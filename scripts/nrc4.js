import path from 'path';
import promptSync from 'prompt-sync';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prompt = promptSync({ sigint: true });
puppeteer.use(StealthPlugin());

const CONFIG = {
    GLOBAL_TIMEOUT: 90000,
    LOGIN_URL: "https://accounts.nike.com/lookup?client_id=4fd2d5e7db76e0f85a6bb56721bd51df&redirect_uri=https://www.nike.com/auth/login&response_type=code&scope=openid%20nike.digital%20profile%20email%20phone%20flow%20country&state=f70d9fe3bd5845b091acca1efde3b0e3&ui_locales=en-SE&code_challenge=Mj3lfHUoEGDeJAnCTzzOH3uRu9FyxgDOk2yl2Y6TAFI&code_challenge_method=S256",
    SELECTORS: {
        EMAIL_INPUT: "input[name='credential']#username",
    }
};


// 🍎 STANDARD MAC CHROME PATH
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROFILE_URL = 'https://www.nike.com/se/en/member/profile/';
const USERNAME_SELECTOR = 'h1[data-testid="subheader-username"]';


// 🍎 MAC M1 CHROME PATH
const TARGET_PROFILE_URL = 'https://www.nike.com/za/member/profile/';

// 🌍 CONFIGURATION
const URLS = {
    LOGIN: 'https://www.nike.com/login',
    PROFILE: 'https://www.nike.com/za/member/profile/' 
};

// Updated Selectors based on your provided DOM
const SELECTORS = {
    EMAIL_INPUT: "#username", 
    NEXT_BUTTON: "button[aria-label='continue'][type='submit']",
    LOGIN_FORM: "form[method='post']",
    USERNAME: 'h1[data-testid="subheader-username"]', 
    PROFILE_INDICATOR: 'a[href*="/member/profile"]' 
};


async function run() {
    console.log('🚀 Launching Native Chrome...');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox'],
        // executablePath: '/path/to/chrome' // Uncomment if using specific chrome
    });

    const page = (await browser.pages())[0];

    // --- SHARED STATE ---
    let capturedToken = null;
    let emailValue = null;

    // --- 1. SETUP NODE <-> BROWSER BRIDGE ---
    // This function allows the browser to send data directly to Node
    // preventing data loss if the page navigates immediately.
    await page.exposeFunction('sendEmailToNode', (email) => {
        if (email && !emailValue) {
            console.log(`⚡ bridge: Email captured via Click/Submit: ${email}`);
            emailValue = email;
        }
    });

    // --- 2. NETWORK LISTENER (Token & Payload Backup) ---
    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
        const url = request.url();
        const headers = request.headers();
        const postData = request.postData();

        // Capture Token
        if ((url.includes('api.nike.com') || url.includes('unite.nike.com')) && headers['authorization']) {
            capturedToken = headers['authorization'];
        }

        // BACKUP: Capture Email from Network Payload
        // If the form submits via API, the email will be in the JSON body
        if (postData && (url.includes('login') || url.includes('check') || url.includes('unite'))) {
            try {
                // Nike payloads are usually JSON
                const json = JSON.parse(postData);
                // Check common field names for email
                const possibleEmail = json.username || json.emailAddress || json.credential; 
                if (possibleEmail && !emailValue) {
                     console.log(`📡 network: Email captured from API Payload: ${possibleEmail}`);
                     emailValue = possibleEmail;
                }
            } catch (e) {
                // Ignore parsing errors for non-JSON payloads
            }
        }

        request.continue();
    });

    try {
        console.log('🌐 Navigating to Login...');
        await page.goto(URLS.LOGIN, { waitUntil: 'domcontentloaded' });

        // --- 3. INJECT LISTENERS ---
        console.log('👀 Waiting for login form...');
        await page.waitForSelector(SELECTORS.EMAIL_INPUT, { visible: true, timeout: 60000 });

        // Attach listeners to the DOM elements
        await page.evaluate((selectors) => {
            const emailInput = document.querySelector(selectors.EMAIL_INPUT);
            const submitBtn = document.querySelector(selectors.NEXT_BUTTON);
            const form = document.querySelector(selectors.LOGIN_FORM);

            const capture = () => {
                if (emailInput && emailInput.value) {
                    // Call the Node.js function we exposed earlier
                    window.sendEmailToNode(emailInput.value.trim());
                }
            };

            // Listener 1: Form Submit (covers Enter key)
            if (form) {
                form.addEventListener('submit', capture);
            }

            // Listener 2: Button Click (covers mouse click)
            if (submitBtn) {
                submitBtn.addEventListener('click', capture); // capturing phase not strictly needed here
                // Add 'mousedown' as a backup in case click is intercepted by React
                submitBtn.addEventListener('mousedown', capture);
            }

        }, SELECTORS);

        console.log('✅ Listeners attached. Please enter email and click Continue.');

        // --- 4. WAIT FOR NAVIGATION ---
        // We wait for the URL to change significantly or a specific element to vanish
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 });

        // --- 5. FINAL CHECK & OUTPUT ---
        // If capture failed, try one last check in localStorage (common in SPAs)
        if (!emailValue) {
             emailValue = await page.evaluate(() => localStorage.getItem('userEmail') || localStorage.getItem('nike.email'));
        }


        console.log('✅ Login Detected! Navigating to Profile...');

        // --- 6. NAVIGATE TO PROFILE ---
        await page.goto(URLS.PROFILE, { waitUntil: 'networkidle2', timeout: 0 });

        // --- 7. EXTRACT USERNAME ---
        console.log('👀 Waiting for username...');
        await page.waitForSelector(SELECTORS.USERNAME, { visible: true, timeout: 0 });
        const username = await page.$eval(SELECTORS.USERNAME, el => el.innerText);

        // --- 8. OUTPUT RESULTS ---
        // console.log('\n' + '='.repeat(60));
        // console.log('🎉 EXTRACTION COMPLETE');
        // console.log('='.repeat(60));
        // console.log(`📧 User Email:    ${emailValue || 'Not captured'}`);
        // console.log(`👤 Username:      ${username}`);
        // console.log(`🔑 Bearer Token:  ${capturedToken ? capturedToken.substring(0, 40) + '...' : 'Waiting for API call...'}`);
        // console.log('='.repeat(60) + '\n');

        // await browser.close();

        console.log('\n' + '='.repeat(60));
        console.log('🎉 EXTRACTION COMPLETE');
        console.log('='.repeat(60));
        console.log(`📧 User Email:    ${emailValue || '❌ Failed to capture'}`);
        console.log(`🔑 Bearer Token:  ${capturedToken ? 'Captured' : 'Waiting...'}`);
            console.log(`👤 Username:      ${username}`);
        if(capturedToken) console.log(`   ${capturedToken}...`);
        console.log('='.repeat(60) + '\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

run();