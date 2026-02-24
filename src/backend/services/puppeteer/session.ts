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
    avatar: string | null;
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

// ─── Anchor to globalThis ─────────────────────────────────────────────────────
//
// Next.js re-evaluates modules across API route boundaries within the same
// process. A module-level `new PuppeteerSessionManager()` at the bottom of
// this file produces a FRESH instance (with an empty `sessions` Map) every
// time a different API route imports it — so `initSession()` stores the
// session on instance A, but `submitEmail()` runs on instance B and can't
// find it, causing "Session not found or expired".
//
// Pinning to `globalThis` guarantees every import across every module
// boundary returns the exact same object for the lifetime of the process.
//
declare global {

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
        CODE_SUBMIT: 'button[aria-label="Sign In"][type="submit"]',

        // ── New Confirmation Page Selectors ──
        CONFIRMATION_EMAIL: 'span[data-testid="username"]',
        CONFIRMATION_AVATAR: 'img[alt="Avatar"]',
        CONFIRMATION_CONTINUE_BTN: 'form[action="#"] button[type="submit"].nds-btn'
    };

    private sessions = new Map<string, ActiveSession>();
    private readonly SESSION_TIMEOUT_MS = 5 * 60 * 1000;

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

    // ─── Network capture setup ────────────────────────────────────────────────

    /**
     * Sets up request interception and the Node↔Browser email bridge.
     * Called ONCE in submitEmail — the listener stays alive for the entire page.
     *
     * Token capture works via a mutable __resolveToken reference on the session:
     *   - The request listener calls __resolveToken(token) whenever it sees an
     *     auth header, regardless of when that happens.
     *   - makeTokenPromise() (called right before page.goto(PROFILE)) creates a
     *     fresh Promise and sets __resolveToken to its resolve function, so the
     *     timeout starts at exactly the right moment.
     */
    private async setupNetworkCapture(
        sessionId: string,
        page: Page,
        emailFallback: string,
    ): Promise<void> {
        const session = this.sessions.get(sessionId)!;

        // ── 1. Node↔Browser email bridge (same pattern as captureNikeAuth) ──
        await page.exposeFunction('sendEmailToNode', (email: string) => {
            if (email && !(session as any).__capturedEmail) {
                console.log(`[${sessionId}] ⚡ bridge: Email captured via DOM listener: ${email}`);
                (session as any).__capturedEmail = email;
            }
        });

        // ── 2. Request interception ───────────────────────────────────────────
        await page.setRequestInterception(true);

        page.on('request', (request) => {
            const url = request.url();
            const headers = request.headers();
            const postData = request.postData();

            // ── Token capture ─────────────────────────────────────────────────
            if (
                (url.includes('api.nike.com') || url.includes('unite.nike.com')) &&
                headers.authorization
            ) {
                const token = headers.authorization;
                (session as any).__capturedToken = token;

                // Call the current promise resolver if makeTokenPromise() has armed one.
                // __resolveToken is replaced each time makeTokenPromise() is called,
                // so this always notifies the most recently created promise.
                const resolver = (session as any).__resolveToken as ((t: string) => void) | undefined;
                if (resolver) {
                    console.log(`[${sessionId}] 🔑 network: Bearer token captured — resolving promise`);
                    (session as any).__resolveToken = undefined; // prevent double-resolve
                    resolver(token);
                }
            }

            // ── Email capture (network payload backup) ────────────────────────
            if (
                postData &&
                (url.includes('login') || url.includes('check') || url.includes('unite'))
            ) {
                try {
                    const json = JSON.parse(postData);
                    const possibleEmail =
                        json.username ?? json.emailAddress ?? json.credential;
                    if (possibleEmail && !(session as any).__capturedEmail) {
                        console.log(`[${sessionId}] 📡 network: Email captured from payload: ${possibleEmail}`);
                        (session as any).__capturedEmail = possibleEmail;
                    }
                } catch { /* non-JSON body — ignore */ }
            }

            void request.continue();
        });

        // Seed email from what the user typed — network/bridge may refine it later
        if (!(session as any).__capturedEmail) {
            (session as any).__capturedEmail = emailFallback;
        }
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
            // ── Wire up network capture + email bridge ────────────────────────
            // No tokenPromise here — makeTokenPromise() is called in submitCode
            // right before page.goto(PROFILE), which is when the token actually appears.
            await this.setupNetworkCapture(sessionId, page, emailStr);

            // ── Attach DOM-side email listener (same as captureNikeAuth) ──────
            await page.evaluate((selectors) => {
                const emailInput = document.querySelector(selectors.EMAIL_INPUT);
                const submitBtn = document.querySelector(selectors.NEXT_BUTTON);
                const form = document.querySelector(selectors.LOGIN_FORM);

                const capture = () => {
                    const val = (emailInput as HTMLInputElement | null)?.value?.trim();
                    if (val) (window as any).sendEmailToNode(val);
                };

                form?.addEventListener('submit', capture);
                submitBtn?.addEventListener('click', capture);
                submitBtn?.addEventListener('mousedown', capture);
            }, this.SELECTORS);

            // ── Type email ────────────────────────────────────────────────────
            console.log(`[${sessionId}] ⌨️  Typing email into #username...`);
            await page.focus(this.SELECTORS.EMAIL_INPUT);
            await page.type(this.SELECTORS.EMAIL_INPUT, emailStr, { delay: 50 });

            // ── Click Continue ────────────────────────────────────────────────
            console.log(`[${sessionId}] 🖱️  Clicking Continue...`);
            await page.waitForSelector(this.SELECTORS.NEXT_BUTTON, { visible: true });

            await Promise.all([
                // Nike either does a full navigation or a SPA transition — handle both
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 100_000 })
                    .catch(() => {
                        console.log(`[${sessionId}] ℹ️  No full navigation after Continue (SPA flow).`);
                    }),
                page.click(this.SELECTORS.NEXT_BUTTON),
            ]);

            // ── Wait for the next meaningful screen ───────────────────────────
            console.log(`[${sessionId}] 👀 Waiting for code or password screen...`);
            await page.waitForSelector(
                `${this.SELECTORS.CODE_INPUT}, input[type="password"]`,
                { visible: true, timeout: 20_000 },
            );

            console.log(`[${sessionId}] ✅ Next screen loaded. Prompting client for code.`);

            // ── Notify client → open code modal ──────────────────────────────
            sseService.emit(sessionId, 'login-code', { step: 'awaiting-code', sessionId });

        } catch (err: any) {
            console.error(`[${sessionId}] ❌ Error submitting email:`, err.message);
            sseService.emit(sessionId, 'nrc-login-step', { step: 'error', sessionId, message: err.message });
            reject(err);
            throw err;
        }
    }

    // ─── Phase 3: Submit verification code → complete login ───────────────────

    /**
     * Receives the OTP / verification code from the client, submits it,
     * navigates to the profile page, and resolves with the final NikeAuthResult.
     *
     * Token capture strategy (mirrors captureNikeAuth):
     *   - The request listener set up in setupNetworkCapture() stays active for
     *     the lifetime of the page, so it continues intercepting Nike API calls
     *     that fire during and after code submission.
     *   - Rather than reading __capturedToken at an arbitrary point in time,
     *     we await __tokenPromise which resolves the instant the first auth
     *     header appears on the wire (with a 30 s safety timeout).
     *   - localStorage is checked as a final fallback, consistent with captureNikeAuth.
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

            // ── Submit code ───────────────────────────────────────────────────
            console.log(`[${sessionId}] 🖱️  Clicking Submit...`);
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 100_000 }),
                page.click(this.SELECTORS.CODE_SUBMIT),
            ]);

            // ── Handle Intermediate Confirmation Page (If it appears) ─────────
            console.log(`[${sessionId}] 🔍 Checking for intermediate confirmation page...`);

            // Short timeout because this page only routes conditionally
            const isConfirmationPage = await page
                .waitForSelector(this.SELECTORS.CONFIRMATION_EMAIL, { visible: true, timeout: 5_000 })
                .then(() => true)
                .catch(() => false);

            let extractedName = null;
            let extractedAvatar = null;
            let extractedConfirmEmail = null;

            if (isConfirmationPage) {
                console.log(`[${sessionId}] 👤 Confirmation page detected. Extracting details...`);

                const details = await page.evaluate((selectors) => {
                    const emailEl = document.querySelector(selectors.CONFIRMATION_EMAIL);
                    const avatarEl = document.querySelector(selectors.CONFIRMATION_AVATAR);
                    const h1El = document.querySelector('h1');

                    console.log('avatarEl', avatarEl);


                    let name = null;
                    if (h1El && h1El.textContent) {
                        const match = /continue as (.+)\?/i.exec(h1El.textContent);
                        if (match) name = match[1]?.trim();
                    }

                    return {
                        email: emailEl ? (emailEl as HTMLElement).innerText.trim() : null,
                        avatar: avatarEl ? (avatarEl as HTMLImageElement).src : null,
                        name: name
                    };
                }, this.SELECTORS);

                extractedName = details.name;
                extractedAvatar = details.avatar;
                extractedConfirmEmail = details.email;

                console.log(`[${sessionId}] 📌 Extracted - Name: ${extractedName || 'N/A'}, Email: ${extractedConfirmEmail || 'N/A'}`);
                console.log(`[${sessionId}] 🖱️  Clicking 'Continue' on confirmation page...`);

                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60_000 }),
                    page.click(this.SELECTORS.CONFIRMATION_CONTINUE_BTN),
                ]);
            }

            // ── Navigate to profile and capture token ─────────────────────────
            console.log(`[${sessionId}] 🏃 Navigating to profile and capturing token...`);

            const [capturedToken] = await Promise.all([
                page.waitForRequest(
                    (request) => {
                        const url = request.url();
                        const hasAuth = !!request.headers().authorization;
                        const isNikeApi = url.includes('api.nike.com') || url.includes('unite.nike.com');
                        return isNikeApi && hasAuth;
                    },
                    { timeout: 200_000 }
                ).then(req => req.headers().authorization)
                    .catch((err) => {
                        console.warn(`[${sessionId}] ⚠️  Token capture timed out or failed: ${err.message}`);
                        return (session as any).__capturedToken ?? null;
                    }),
                page.goto(this.URLS.PROFILE, { waitUntil: 'networkidle2', timeout: 200_000 }),
            ]);

            // ── Extract username ──────────────────────────────────────────────
            console.log(`[${sessionId}] 👀 Waiting for username...`);
            let username = extractedName;

            // Only scrape the profile username if we didn't already get it from the confirmation page
            if (!username) {
                try {
                    await page.waitForSelector(this.SELECTORS.USERNAME, { visible: true, timeout: 10_000 });
                    username = await page.$eval(
                        this.SELECTORS.USERNAME,
                        (el) => (el as HTMLElement).innerText,
                    );
                } catch (err) {
                    console.log(`[${sessionId}] ⚠️ Could not extract username from profile page.`);
                }
            }

            // ── Final email fallback ──────────────────────────────────────────
            let emailValue: string = (session as any).__capturedEmail ?? extractedConfirmEmail ?? '';
            if (!emailValue) {
                emailValue = await page.evaluate(
                    () =>
                        localStorage.getItem('userEmail') ??
                        localStorage.getItem('nike.email') ??
                        '',
                );
            }

            // ── Log summary ───────────────────────────────────────────────────
            console.log('\n' + '='.repeat(60));
            console.log(`[${sessionId}] 🎉 EXTRACTION COMPLETE`);
            console.log('='.repeat(60));
            console.log(`📧 Email:    ${emailValue || '❌ Failed to capture'}`);
            console.log(`👤 Username: ${username || '❌ Failed to capture'}`);
            if (extractedAvatar) console.log(`🖼️  Avatar:   Captured ✅`);
            console.log(`🔑 Token:    ${capturedToken ? 'Captured ✅' : '❌ Failed to capture'}`);
            if (capturedToken) console.log(capturedToken);
            console.log('='.repeat(60) + '\n');

            const result: NikeAuthResult = {
                email: emailValue,
                token: capturedToken,
                username: username || '',
                avatar: extractedAvatar
            };

            sseService.emit(sessionId, 'nrc-login-step', { step: 'success', sessionId });
            resolve(result);
            return result;

        } catch (err: any) {
            console.error(`[${sessionId}] ❌ Error submitting code:`, err.message);
            sseService.emit(sessionId, 'nrc-login-step', { step: 'error', sessionId, message: err.message });
            reject(err);
            throw err;
        }
    };
}

export const puppeteerSessionManager =
    (globalThis.__puppeteerSessionManager ??= new PuppeteerSessionManager());