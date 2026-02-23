import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
import type { Browser, Page } from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';
import { webhookService } from '../webhook';

// Register the stealth plugin
puppeteer.use(StealthPlugin());

export interface NikeAuthResult {
    email: string | null;
    token: string | null;
    username: string | null;
}

export interface CaptureOptions {
    headless?: boolean | 'new';
    userDataDir?: string;
    timeout?: number;
}

interface ActiveSession {
    browser: Browser;
    page: Page;
    startTime: number;
    // Promises to resolve when the login flow completes
    resolve: (value: NikeAuthResult | PromiseLike<NikeAuthResult>) => void;
    reject: (reason?: any) => void;
}

export class PuppeteerSessionManager {
    private readonly DEFAULT_CHROME_PATH =
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

    private readonly URLS = {
        LOGIN: 'https://www.nike.com/login',
        PROFILE: 'https://www.nike.com/za/member/profile/',
    };

    private readonly SELECTORS = {
        EMAIL_INPUT: '#username',
        NEXT_BUTTON: "button[aria-label='continue'][type='submit']",
        LOGIN_FORM: "form[method='post']",
        USERNAME: 'h1[data-testid="subheader-username"]',
    };

    // Store active sessions in memory
    private sessions = new Map<string, ActiveSession>();

    // Cleanup old sessions (e.g. if a user abandons the login flow)
    private readonly SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

    constructor() {
        // Periodically clean up stale sessions
        setInterval(() => this.cleanupStaleSessions(), 60 * 1000);
    }

    private cleanupStaleSessions() {
        const now = Date.now();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.startTime > this.SESSION_TIMEOUT_MS) {
                console.warn(`[PuppeteerSessionManager] Cleaning up stale session: ${sessionId}`);
                session.reject(new Error('Login session timed out'));
                this.closeSession(sessionId).catch(console.error);
            }
        }
    }

    private async closeSession(sessionId: string) {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        try {
            await session.browser.close();
        } catch (err) {
            console.error(`[PuppeteerSessionManager] Error closing browser for ${sessionId}:`, err);
        } finally {
            this.sessions.delete(sessionId);
        }
    }

    /**
     * Starts a new Puppeteer session, navigates to Nike login,
     * waits for the email field to be ready, and then pauses.
     */
    public async initSession(options: CaptureOptions = {}): Promise<string> {
        const sessionId = uuidv4();
        const { headless = false, userDataDir, timeout = 0 } = options;
        const chromePath = process.env.CHROME_PATH ?? this.DEFAULT_CHROME_PATH;

        console.log(`[PuppeteerSessionManager] Starting new session: ${sessionId}`);

        const browser = (await puppeteer.launch({
            headless,
            executablePath: chromePath,
            userDataDir,
            defaultViewport: null,
            args: [
                '--start-maximized',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
            ],
            ignoreDefaultArgs: ['--enable-automation'],
        })) as Browser;

        try {
            const page = (await browser.pages())[0] ?? (await browser.newPage());

            // Create the pending promise for the full login flow result
            let resolvePromise!: (value: NikeAuthResult | PromiseLike<NikeAuthResult>) => void;
            let rejectPromise!: (reason?: any) => void;
            const resultPromise = new Promise<NikeAuthResult>((resolve, reject) => {
                resolvePromise = resolve;
                rejectPromise = reject;
            });

            // Avoid floating promises here, let the background flow continue
            // but return the sessionId immediately. We store the promise resolvers in the session map.
            this.sessions.set(sessionId, {
                browser,
                page,
                startTime: Date.now(),
                resolve: resolvePromise,
                reject: rejectPromise,
            });

            console.log(sessionId, page, timeout);


            // Start the background navigation to Nike Login
            this.startNavigationFlow(sessionId, page, timeout).catch(err => {
                console.error(`[PuppeteerSessionManager] Background flow error for ${sessionId}:`, err);
                rejectPromise(err);
                this.closeSession(sessionId).catch(console.error);
            });

            // Start waiting for the result in a detached manner (so we can log it when it finishes later)
            resultPromise
                .then(() => console.log(`[PuppeteerSessionManager] Flow completed for ${sessionId}`))
                .catch(() => console.log(`[PuppeteerSessionManager] Flow failed for ${sessionId}`))
                .finally(() => this.closeSession(sessionId).catch(console.error));


            return sessionId;
        } catch (err) {
            await browser.close();
            throw err;
        }
    }

    /**
     * The background step 1: Navigates to Nike, waits for the email input.
     */
    private async startNavigationFlow(sessionId: string, page: Page, timeout: number) {
        console.log(`[${sessionId}] 🌐 Navigating to Login...`);
        await page.goto(this.URLS.LOGIN, { waitUntil: 'domcontentloaded', timeout });

        console.log(`[${sessionId}] 👀 Waiting for login form...`);
        await page.waitForSelector(this.SELECTORS.EMAIL_INPUT, {
            visible: true,
            timeout: 60000,
        });

        // Broadcast webhook that the session is ready for credentials!
        console.log(`[${sessionId}] ✅ Form ready. Emitting webhook for credentials prompt.`);
        webhookService.emit('nrc-login-step', { step: 'ready', sessionId });
        console.log('webhook emmitted??');
    }

    /**
     * Resumes a paused session, inputs the credentials, captures the token, and resolves the session.
     */
    public async submitCredentials(sessionId: string, emailStr: string, passwordStr: string): Promise<NikeAuthResult> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found or expired.`);
        }

        const { page, resolve, reject } = session;
        console.log(`[${sessionId}] 🤖 Resuming flow. Automating Login entry...`);

        let capturedToken: string | null = null;
        let emailValue: string | null = null;

        try {
            // --- 1. SETUP NETWORK LISTENER ---
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                const url = request.url();
                const headers = request.headers();
                const postData = request.postData();

                // Capture Token
                if ((url.includes('api.nike.com') || url.includes('unite.nike.com')) && headers.authorization) {
                    capturedToken = headers.authorization;
                }

                // BACKUP: Capture Email
                if (postData && (url.includes('login') || url.includes('check') || url.includes('unite'))) {
                    try {
                        const json = JSON.parse(postData);
                        const possibleEmail = json.username ?? json.emailAddress ?? json.credential;
                        if (possibleEmail && !emailValue) {
                            console.log(`[${sessionId}] 📡 network: Email captured from Payload: ${possibleEmail}`);
                            emailValue = possibleEmail;
                        }
                    } catch (_e) { }
                }
                void request.continue();
            });

            // --- 2. INPUT CREDENTIALS ---
            await page.type(this.SELECTORS.EMAIL_INPUT, emailStr, { delay: 50 });
            await page.waitForSelector(this.SELECTORS.NEXT_BUTTON, { visible: true });
            await page.click(this.SELECTORS.NEXT_BUTTON);

            // Wait for password field
            const PWD_SELECTOR = 'input[type="password"]';
            await page.waitForSelector(PWD_SELECTOR, { visible: true, timeout: 15000 });
            await page.type(PWD_SELECTOR, passwordStr, { delay: 50 });

            // Click sign in
            webhookService.emit('nrc-login-step', { step: 'processing', sessionId });

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
                page.click('button[type="submit"]')
            ]);

            emailValue = emailValue ?? emailStr;

            // --- 3. FINAL CHECK ---
            emailValue ??= await page.evaluate(() => localStorage.getItem('userEmail') ?? localStorage.getItem('nike.email'));
            console.log(`[${sessionId}] ✅ Login successfully processed! Navigating to Profile...`);

            // --- 4. NAVIGATE TO PROFILE ---
            await page.goto(this.URLS.PROFILE, { waitUntil: 'networkidle2', timeout: 30000 });

            // --- 5. EXTRACT USERNAME ---
            console.log(`[${sessionId}] 👀 Waiting for username...`);
            await page.waitForSelector(this.SELECTORS.USERNAME, { visible: true, timeout: 15000 });
            const username = await page.$eval(this.SELECTORS.USERNAME, (el) => (el as HTMLElement).innerText);

            const result: NikeAuthResult = {
                email: emailValue ?? '',
                token: capturedToken,
                username: username,
            };

            console.log(`[${sessionId}] 🎉 Flow complete. Username: ${username}`);

            webhookService.emit('nrc-login-step', { step: 'success', sessionId });

            // Resolve the parent promise gracefully
            resolve(result);
            return result;

        } catch (err: any) {
            console.error(`[${sessionId}] ❌ Error during credentials submission:`, err.message);
            webhookService.emit('nrc-login-step', { step: 'error', sessionId, message: err.message });
            reject(err);
            throw err;
        }
    }
}

export const puppeteerSessionManager = new PuppeteerSessionManager();
