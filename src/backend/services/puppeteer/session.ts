// src/services/puppeteer/puppeteerSessionManager.ts
//
// submitCredentials — Phase 1: email only
//
// Flow:
//   1. Receive email from client
//   2. Type email into #username
//   3. Click continue button
//   4. Wait for next screen to load
//   5. Emit 'login-code' SSE event → client opens code modal

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
import type { Browser, Page } from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';
import { sseService } from '../events';

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
    resolve: (value: NikeAuthResult | PromiseLike<NikeAuthResult>) => void;
    reject: (reason?: any) => void;
}

declare global {
    // eslint-disable-next-line no-var
    var __puppeteerSessionManager: PuppeteerSessionManager | undefined;
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
        CODE_INPUT: 'input[name="verificationCode"]',
        CODE_SUBMIT: 'button[aria-label="Sign In"][type="submit"]',   // submit button on the code screen
    };

    private sessions = new Map<string, ActiveSession>();
    private readonly SESSION_TIMEOUT_MS = 5 * 600 * 1000;

    constructor() {
        setInterval(() => this.cleanupStaleSessions(), 60 * 1000);
    }

    // ─── Session lifecycle ────────────────────────────────────────────────────

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
            sseService.close(sessionId);
        }
    }

    // ─── Phase 0: Init ────────────────────────────────────────────────────────

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

            let resolvePromise!: (value: NikeAuthResult | PromiseLike<NikeAuthResult>) => void;
            let rejectPromise!: (reason?: any) => void;
            const resultPromise = new Promise<NikeAuthResult>((resolve, reject) => {
                resolvePromise = resolve;
                rejectPromise = reject;
            });

            this.sessions.set(sessionId, {
                browser,
                page,
                startTime: Date.now(),
                resolve: resolvePromise,
                reject: rejectPromise,
            });

            this.startNavigationFlow(sessionId, page, timeout).catch(err => {
                console.error(`[PuppeteerSessionManager] Navigation error for ${sessionId}:`, err);
                rejectPromise(err);
                this.closeSession(sessionId).catch(console.error);
            });

            resultPromise
                .then(() => console.log(`[PuppeteerSessionManager] Flow completed: ${sessionId}`))
                .catch(() => console.log(`[PuppeteerSessionManager] Flow failed: ${sessionId}`))
                .finally(() => this.closeSession(sessionId).catch(console.error));

            return sessionId;
        } catch (err) {
            await browser.close();
            throw err;
        }
    }

    // ─── Phase 1: Navigate to Nike login ─────────────────────────────────────

    private async startNavigationFlow(sessionId: string, page: Page, timeout: number) {
        console.log(`[${sessionId}] 🌐 Navigating to Login...`);
        await page.goto(this.URLS.LOGIN, { waitUntil: 'domcontentloaded', timeout });

        console.log(`[${sessionId}] 👀 Waiting for email input...`);
        await page.waitForSelector(this.SELECTORS.EMAIL_INPUT, {
            visible: true,
            timeout: 60_000,
        });

        console.log(`[${sessionId}] ✅ Email form ready. Notifying client.`);
        // → client opens email modal
        sseService.emit(sessionId, 'nrc-login-step', { step: 'ready', sessionId });
    }

    // ─── Phase 2: Submit email → trigger code modal ───────────────────────────

    /**
     * Receives the user's email, types it into the Nike login form,
     * clicks Continue, and — once Nike loads the next screen — emits
     * a 'login-code' SSE event so the client can show the code entry modal.
     */
    public async submitEmail(sessionId: string, emailStr: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found or expired.`);
        }

        const { page, reject } = session;

        console.log(`[${sessionId}] 📧 Submitting email: ${emailStr}`);

        try {
            // ── Setup network listener to capture the bearer token early ──────
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                const headers = request.headers();
                const url = request.url();
                const postData = request.postData();

                if (
                    (url.includes('api.nike.com') || url.includes('unite.nike.com')) &&
                    headers.authorization
                ) {
                    // Store on session for use in submitCode()
                    (session as any).__capturedToken = headers.authorization;
                }

                if (postData && (url.includes('login') || url.includes('check') || url.includes('unite'))) {
                    try {
                        const json = JSON.parse(postData);
                        const possibleEmail = json.username ?? json.emailAddress ?? json.credential;
                        if (possibleEmail && !(session as any).__capturedEmail) {
                            (session as any).__capturedEmail = possibleEmail;
                        }
                    } catch { /* non-JSON body — ignore */ }
                }

                void request.continue();
            });

            // ── Type email ────────────────────────────────────────────────────
            console.log(`[${sessionId}] ⌨️  Typing email into #username...`);
            await page.focus(this.SELECTORS.EMAIL_INPUT);
            await page.type(this.SELECTORS.EMAIL_INPUT, emailStr, { delay: 50 });

            // ── Click Continue ────────────────────────────────────────────────
            console.log(`[${sessionId}] 🖱️  Clicking Continue...`);
            await page.waitForSelector(this.SELECTORS.NEXT_BUTTON, { visible: true });

            await Promise.all([
                // Nike either navigates or does a SPA transition — handle both
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30_000 })
                    .catch(() => {
                        // SPA transition: navigation may not fire — that's fine
                        console.log(`[${sessionId}] ℹ️  No full navigation after Continue (SPA flow).`);
                    }),
                page.click(this.SELECTORS.NEXT_BUTTON),
            ]);

            // ── Wait for the next meaningful screen ───────────────────────────
            // Nike shows either a password field or an OTP/code field next.
            // We wait for whichever appears first.
            console.log(`[${sessionId}] 👀 Waiting for code or password screen...`);
            await page.waitForSelector(
                `${this.SELECTORS.CODE_INPUT}, input[type="password"]`,
                { visible: true, timeout: 20_000 },
            );

            console.log(`[${sessionId}] ✅ Next screen loaded. Prompting client for code.`);

            // ── Notify client → open code modal ──────────────────────────────
            sseService.emit(sessionId, 'login-code', {
                step: 'awaiting-code',
                sessionId,
            });

        } catch (err: any) {
            console.error(`[${sessionId}] ❌ Error submitting email:`, err.message);
            sseService.emit(sessionId, 'nrc-login-step', {
                step: 'error',
                sessionId,
                message: err.message,
            });
            reject(err);
            throw err;
        }
    }

    // ─── Phase 3: Submit verification code → complete login ───────────────────

    /**
     * Receives the OTP / verification code from the client, submits it,
     * navigates to the profile page, and resolves with the final NikeAuthResult.
     */
    public async submitCode(sessionId: string, code: string): Promise<NikeAuthResult> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found or expired.`);
        }

        const { page, resolve, reject } = session;

        console.log(`[${sessionId}] 🔑 Submitting verification code...`);

        try {
            sseService.emit(sessionId, 'nrc-login-step', { step: 'processing', sessionId });

            // ── Type the code ─────────────────────────────────────────────────
            await page.waitForSelector(this.SELECTORS.CODE_INPUT, { visible: true, timeout: 10_000 });
            await page.focus(this.SELECTORS.CODE_INPUT);
            await page.type(this.SELECTORS.CODE_INPUT, code, { delay: 80 });

            // ── Submit ────────────────────────────────────────────────────────
            console.log(`[${sessionId}] 🖱️  Clicking Submit...`);
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30_000 }),
                page.click(this.SELECTORS.CODE_SUBMIT),
            ]);

            // ── Navigate to profile ───────────────────────────────────────────
            console.log(`[${sessionId}] 🏃 Navigating to profile...`);
            await page.goto(this.URLS.PROFILE, { waitUntil: 'networkidle2', timeout: 30_000 });

            // ── Extract username ──────────────────────────────────────────────
            console.log(`[${sessionId}] 👀 Waiting for username...`);
            await page.waitForSelector(this.SELECTORS.USERNAME, { visible: true, timeout: 15_000 });
            const username = await page.$eval(
                this.SELECTORS.USERNAME,
                (el) => (el as HTMLElement).innerText,
            );

            const capturedToken: string | null = (session as any).__capturedToken ?? null;
            const emailValue: string = (session as any).__capturedEmail ?? '';

            const result: NikeAuthResult = {
                email: emailValue,
                token: capturedToken,
                username: username,
            };

            console.log(`[${sessionId}] 🎉 Flow complete. Username: ${username}`);
            sseService.emit(sessionId, 'nrc-login-step', { step: 'success', sessionId });

            resolve(result);
            return result;

        } catch (err: any) {
            console.error(`[${sessionId}] ❌ Error submitting code:`, err.message);
            sseService.emit(sessionId, 'nrc-login-step', {
                step: 'error',
                sessionId,
                message: err.message,
            });
            reject(err);
            throw err;
        }
    }
}


export const puppeteerSessionManager =
    (globalThis.__puppeteerSessionManager ??= new PuppeteerSessionManager());