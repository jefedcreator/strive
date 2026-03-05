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
import type { ActiveSession, PuppeteerNikeAuthResult } from '@/types';
import type { CaptureOptions, NikeAuthResult } from '.';

puppeteer.use(StealthPlugin());

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
    process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome-stable';

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
    CONFIRMATION_CONTINUE_BTN: 'form[action="#"] button[type="submit"].nds-btn',
  };

  private sessions = new Map<string, ActiveSession>();
  private readonly SESSION_TIMEOUT_MS = 5 * 60 * 1000;

  constructor() {
    setInterval(() => this.cleanupStaleSessions(), 60 * 1000);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  // ─── Session lifecycle ────────────────────────────────────────────────────

  private cleanupStaleSessions() {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.startTime > this.SESSION_TIMEOUT_MS) {
        console.warn(
          `[PuppeteerSessionManager] Cleaning up stale session: ${sessionId}`
        );
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
      console.error(
        `[PuppeteerSessionManager] Error closing browser for ${sessionId}:`,
        err
      );
    } finally {
      this.sessions.delete(sessionId);
      sseService.close(sessionId);
    }
  }

  // ─── Phase 0: Init ────────────────────────────────────────────────────────

  public async initSession(options: CaptureOptions = {}): Promise<string> {
    const sessionId = uuidv4();
    const { headless = false, userDataDir, timeout = 0 } = options;

    console.log(`[PuppeteerSessionManager] Starting new session: ${sessionId}`);

    const chromePath = process.env.CHROME_PATH ?? this.DEFAULT_CHROME_PATH;

    // ── BrightData residential proxy (South African IP) ──────────────
    // On EC2, datacenter IPs get flagged by Nike/Forter. Route Chrome
    // through BrightData residential proxy with -country-za to get a
    // South African residential IP while keeping the real Chrome fingerprint.
    const proxyUser = process.env.BRIGHTDATA_USERNAME;
    const proxyPass = process.env.BRIGHTDATA_PASSWORD;
    const useProxy = !!(proxyUser && proxyPass);

    const launchArgs = [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ];

    if (useProxy) {
      // BrightData super proxy endpoint — append country targeting
      launchArgs.push('--proxy-server=http://brd.superproxy.io:33335');
      console.log(
        `[PuppeteerSessionManager] 🌍 Proxy: BrightData residential (ZA)`
      );
    }

    console.log(`[PuppeteerSessionManager] Chrome: ${chromePath}`);

    const browser = (await puppeteer.launch({
      headless,
      executablePath: chromePath,
      userDataDir,
      defaultViewport: null,
      args: launchArgs,
      ignoreDefaultArgs: ['--enable-automation'],
    })) as Browser;

    try {
      const page = (await browser.pages())[0] ?? (await browser.newPage());

      // Authenticate with BrightData proxy (country-za for South Africa)
      if (useProxy) {
        await page.authenticate({
          username: `${proxyUser}-country-za`,
          password: proxyPass,
        });
      }

      // ── Anti-fingerprinting patches (Xvfb / Linux) ────────────────────
      // Forter detects Xvfb via WebGL renderer (Mesa/llvmpipe), navigator
      // properties (Linux platform), and screen dimensions. These patches
      // make EC2 + Xvfb look like a normal Windows desktop to Forter.
      if (process.platform === 'linux') {
        console.log(
          `[PuppeteerSessionManager] 🛡️ Applying anti-fingerprint patches (Linux/Xvfb)`
        );

        await page.evaluateOnNewDocument(() => {
          // ── Spoof WebGL renderer & vendor ──────────────────────────
          const getParameterProto =
            WebGLRenderingContext.prototype.getParameter;
          WebGLRenderingContext.prototype.getParameter = function (
            param: number
          ) {
            // UNMASKED_VENDOR_WEBGL
            if (param === 0x9245) return 'Google Inc. (NVIDIA)';
            // UNMASKED_RENDERER_WEBGL
            if (param === 0x9246)
              return 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1080 Direct3D11 vs_5_0 ps_5_0, D3D11)';
            return getParameterProto.call(this, param);
          };

          // Also patch WebGL2
          if (typeof WebGL2RenderingContext !== 'undefined') {
            const getParameterProto2 =
              WebGL2RenderingContext.prototype.getParameter;
            WebGL2RenderingContext.prototype.getParameter = function (
              param: number
            ) {
              if (param === 0x9245) return 'Google Inc. (NVIDIA)';
              if (param === 0x9246)
                return 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1080 Direct3D11 vs_5_0 ps_5_0, D3D11)';
              return getParameterProto2.call(this, param);
            };
          }

          // ── Spoof navigator properties ────────────────────────────
          Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
          Object.defineProperty(navigator, 'hardwareConcurrency', {
            get: () => 8,
          });
          Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });

          // ── Spoof screen dimensions (realistic desktop) ───────────
          Object.defineProperty(screen, 'colorDepth', { get: () => 24 });
          Object.defineProperty(screen, 'pixelDepth', { get: () => 24 });

          // ── Patch Permissions API (Forter checks this) ────────────
          const originalQuery = window.navigator.permissions?.query;
          if (originalQuery) {
            (window.navigator.permissions as any).query = (parameters: any) =>
              parameters.name === 'notifications'
                ? Promise.resolve({
                  state: Notification.permission,
                } as PermissionStatus)
                : originalQuery.call(window.navigator.permissions, parameters);
          }

          // ── Patch chrome.runtime (make it look like real Chrome) ───
          if (!(window as any).chrome) {
            (window as any).chrome = {};
          }
          if (!(window as any).chrome.runtime) {
            (window as any).chrome.runtime = {
              connect: () => { },
              sendMessage: () => { },
            };
          }
        });
      }

      let resolvePromise!: (
        value: NikeAuthResult | PromiseLike<NikeAuthResult>
      ) => void;
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

      this.startNavigationFlow(sessionId, page, timeout).catch((err) => {
        console.error(
          `[PuppeteerSessionManager] Navigation error for ${sessionId}:`,
          err
        );
        rejectPromise(err);
        this.closeSession(sessionId).catch(console.error);
      });

      resultPromise
        .then(() =>
          console.log(`[PuppeteerSessionManager] Flow completed: ${sessionId}`)
        )
        .catch(() =>
          console.log(`[PuppeteerSessionManager] Flow failed: ${sessionId}`)
        )
        .finally(() => this.closeSession(sessionId).catch(console.error));

      return sessionId;
    } catch (err) {
      await browser.close();
      throw err;
    }
  }

  // ─── Phase 1: Navigate to Nike login ─────────────────────────────────────

  private async startNavigationFlow(
    sessionId: string,
    page: Page,
    timeout: number
  ) {
    console.log(`[${sessionId}] 🌐 Navigating to Login...`);
    await page.goto(this.URLS.LOGIN, {
      waitUntil: 'domcontentloaded',
      timeout,
    });

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
   * Sets up token & email capture. Uses request interception +
   * page.exposeFunction() bridge for Chrome running on the host.
   */
  private async setupNetworkCapture(
    sessionId: string,
    page: Page,
    emailFallback: string
  ): Promise<void> {
    const session = this.sessions.get(sessionId)!;

    // Seed email from what the user typed
    if (!(session as any).__capturedEmail) {
      (session as any).__capturedEmail = emailFallback;
    }

    {
      // Use request interception + exposeFunction (original approach).

      // 1. Node↔Browser email bridge
      await page.exposeFunction('sendEmailToNode', (email: string) => {
        if (email && !(session as any).__capturedEmail) {
          console.log(
            `[${sessionId}] ⚡ bridge: Email captured via DOM listener: ${email}`
          );
          (session as any).__capturedEmail = email;
        }
      });

      // 2. Request interception
      await page.setRequestInterception(true);

      page.on('request', (request) => {
        const url = request.url();
        const headers = request.headers();
        const postData = request.postData();

        // Token capture
        if (
          (url.includes('api.nike.com') || url.includes('unite.nike.com')) &&
          headers.authorization
        ) {
          const token = headers.authorization;
          (session as any).__capturedToken = token;

          const resolver = (session as any).__resolveToken as
            | ((t: string) => void)
            | undefined;
          if (resolver) {
            console.log(
              `[${sessionId}] 🔑 network: Bearer token captured — resolving promise`
            );
            (session as any).__resolveToken = undefined;
            resolver(token);
          }
        }

        // Email capture (network payload backup)
        if (
          postData &&
          (url.includes('login') ||
            url.includes('check') ||
            url.includes('unite'))
        ) {
          try {
            const json = JSON.parse(postData);
            const possibleEmail =
              json.username ?? json.emailAddress ?? json.credential;
            if (possibleEmail && !(session as any).__capturedEmail) {
              console.log(
                `[${sessionId}] 📡 network: Email captured from payload: ${possibleEmail}`
              );
              (session as any).__capturedEmail = possibleEmail;
            }
          } catch {
            /* non-JSON body — ignore */
          }
        }

        void request.continue();
      });
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
      // ── Wire up network capture ──────────────────────────────────────
      await this.setupNetworkCapture(sessionId, page, emailStr);

      // ── Attach DOM-side email listener ─────────────────────────────
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

      // ── Simulate human-like behavior before typing ─────────────────
      // Forter tracks mouse movement, timing, and interaction patterns.
      // Without natural movement, it flags the session as automated.
      console.log(`[${sessionId}] 🖱️  Simulating human behavior...`);

      // Random mouse movements across the page
      const viewport = page.viewport() || { width: 1920, height: 1080 };
      for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
        const x = 100 + Math.floor(Math.random() * (viewport.width - 200));
        const y = 100 + Math.floor(Math.random() * (viewport.height - 200));
        await page.mouse.move(x, y, {
          steps: 10 + Math.floor(Math.random() * 15),
        });
        await new Promise((r) =>
          setTimeout(r, 200 + Math.floor(Math.random() * 400))
        );
      }
      console.log(`[${sessionId}] 🌐 Current URL: ${page.url()}`);

      // ── Type email with human-like timing ──────────────────────────
      console.log(`[${sessionId}] ⌨️  Typing email into #username...`);

      // Move mouse to the input field area first
      const emailBox = await page.$(this.SELECTORS.EMAIL_INPUT);
      if (emailBox) {
        const box = await emailBox.boundingBox();
        if (box) {
          await page.mouse.move(
            box.x + box.width / 2 + (Math.random() * 20 - 10),
            box.y + box.height / 2 + (Math.random() * 6 - 3),
            { steps: 15 }
          );
          await new Promise((r) =>
            setTimeout(r, 300 + Math.floor(Math.random() * 300))
          );
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        } else {
          await page.focus(this.SELECTORS.EMAIL_INPUT);
        }
      } else {
        await page.focus(this.SELECTORS.EMAIL_INPUT);
      }

      // Type with random per-character delay (80-180ms, like a real human)
      for (const char of emailStr) {
        await page.keyboard.type(char, {
          delay: 80 + Math.floor(Math.random() * 100),
        });
      }

      // Small natural pause after typing
      await new Promise((r) =>
        setTimeout(r, 500 + Math.floor(Math.random() * 500))
      );

      // ── Click Continue ────────────────────────────────────────────────
      console.log(`[${sessionId}] 🖱️  Clicking Continue...`);
      await page.waitForSelector(this.SELECTORS.NEXT_BUTTON, { visible: true });

      await Promise.all([
        // Nike either does a full navigation or a SPA transition — handle both
        page
          .waitForNavigation({ waitUntil: 'networkidle2', timeout: 100_000 })
          .catch(() => {
            console.log(
              `[${sessionId}] ℹ️  No full navigation after Continue (SPA flow).`
            );
          }),
        (async () => {
          // Click via mouse coordinates (Forter tracks click origin)
          const btn = await page.$(this.SELECTORS.NEXT_BUTTON);
          const btnBox = btn ? await btn.boundingBox() : null;
          if (btnBox) {
            await page.mouse.move(
              btnBox.x + btnBox.width / 2 + (Math.random() * 10 - 5),
              btnBox.y + btnBox.height / 2 + (Math.random() * 4 - 2),
              { steps: 12 }
            );
            await new Promise((r) =>
              setTimeout(r, 100 + Math.floor(Math.random() * 200))
            );
            await page.mouse.click(
              btnBox.x + btnBox.width / 2,
              btnBox.y + btnBox.height / 2
            );
          } else {
            await page.click(this.SELECTORS.NEXT_BUTTON);
          }
        })(),
      ]);

      // ── Wait for the next meaningful screen ───────────────────────────
      console.log(`[${sessionId}] 👀 Waiting for code or password screen...`);
      await page.waitForSelector(
        `${this.SELECTORS.CODE_INPUT}, input[type="password"]`,
        { visible: true, timeout: 20_000 }
      );

      console.log(
        `[${sessionId}] ✅ Next screen loaded. Prompting client for code.`
      );

      // ── Notify client → open code modal ──────────────────────────────
      sseService.emit(sessionId, 'login-code', {
        step: 'awaiting-code',
        sessionId,
      });
    } catch (err: any) {
      console.error(`[${sessionId}] ❌ Error submitting email:`, err.message);
      try {
        console.log(`[${sessionId}] 🌐 Current URL at error: ${page.url()}`);
      } catch (e) {
        console.log(`[${sessionId}] 🌐 Could not retrieve URL`);
      }

      const fs = require('fs');
      const path = require('path');
      const debugDir = path.join(process.cwd(), 'public', 'debug');

      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
      }

      const debugImageUrl = `/debug/error-${sessionId}.png`;
      const debugHtmlUrl = `/debug/error-${sessionId}.html`;

      try {
        const html = await page.content();
        fs.writeFileSync(path.join(debugDir, `error-${sessionId}.html`), html);

        await page.screenshot({
          path: path.join(debugDir, `error-${sessionId}.png`),
          fullPage: true,
        });
        console.log(
          `[${sessionId}] 📸 Saved debug files to public/debug folder`
        );
      } catch (fsError) {
        console.error(`[${sessionId}] ❌ Failed to save debug files:`, fsError);
      }

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
  public async submitCode(
    sessionId: string,
    code: string
  ): Promise<NikeAuthResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found or expired.`);
    }

    const { page, resolve, reject } = session;
    console.log(`[${sessionId}] 🔑 Submitting verification code...`);

    try {
      sseService.emit(sessionId, 'nrc-login-step', {
        step: 'processing',
        sessionId,
      });

      // ── Type the code ─────────────────────────────────────────────────
      await page.waitForSelector(this.SELECTORS.CODE_INPUT, {
        visible: true,
        timeout: 10_000,
      });
      await page.focus(this.SELECTORS.CODE_INPUT);
      await page.type(this.SELECTORS.CODE_INPUT, code, { delay: 80 });

      // ── Submit code ───────────────────────────────────────────────────
      console.log(`[${sessionId}] 🖱️  Clicking Submit...`);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 100_000 }),
        page.click(this.SELECTORS.CODE_SUBMIT),
      ]);

      // ── Handle Intermediate Confirmation Page (If it appears) ─────────
      console.log(
        `[${sessionId}] 🔍 Checking for intermediate confirmation page...`
      );

      // Short timeout because this page only routes conditionally
      const isConfirmationPage = await page
        .waitForSelector(this.SELECTORS.CONFIRMATION_EMAIL, {
          visible: true,
          timeout: 5_000,
        })
        .then(() => true)
        .catch(() => false);

      let extractedName = null;
      let extractedAvatar = null;
      let extractedConfirmEmail = null;

      if (isConfirmationPage) {
        console.log(
          `[${sessionId}] 👤 Confirmation page detected. Extracting details...`
        );

        const details = await page.evaluate((selectors) => {
          const emailEl = document.querySelector(selectors.CONFIRMATION_EMAIL);
          const avatarEl = document.querySelector(
            selectors.CONFIRMATION_AVATAR
          );
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
            name: name,
          };
        }, this.SELECTORS);

        extractedName = details.name;
        extractedAvatar = details.avatar;
        extractedConfirmEmail = details.email;

        console.log(
          `[${sessionId}] 📌 Extracted - Name: ${extractedName || 'N/A'}, Email: ${extractedConfirmEmail || 'N/A'}`
        );
        console.log(
          `[${sessionId}] 🖱️  Clicking 'Continue' on confirmation page...`
        );

        await Promise.all([
          page.waitForNavigation({
            waitUntil: 'networkidle2',
            timeout: 60_000,
          }),
          page.click(this.SELECTORS.CONFIRMATION_CONTINUE_BTN),
        ]);
      }

      // ── Navigate to profile and capture token ─────────────────────────
      console.log(
        `[${sessionId}] 🏃 Navigating to profile and capturing token...`
      );

      let capturedToken: string | null = null;

      // ── LOCAL: waitForRequest + goto in parallel ──────────────────────
      const [token] = await Promise.all([
        page
          .waitForRequest(
            (request) => {
              const url = request.url();
              const hasAuth = !!request.headers().authorization;
              const isNikeApi =
                url.includes('api.nike.com') || url.includes('unite.nike.com');
              return isNikeApi && hasAuth;
            },
            { timeout: 200_000 }
          )
          .then((req) => req.headers().authorization)
          .catch((err) => {
            console.warn(
              `[${sessionId}] ⚠️  Token capture timed out or failed: ${err.message}`
            );
            return (session as any).__capturedToken ?? null;
          }),
        page.goto(this.URLS.PROFILE, {
          waitUntil: 'networkidle2',
          timeout: 200_000,
        }),
      ]);
      capturedToken = token;

      // ── Extract username ──────────────────────────────────────────────
      console.log(`[${sessionId}] 👀 Waiting for username...`);
      let username = extractedName;

      // Only scrape the profile username if we didn't already get it from the confirmation page
      if (!username) {
        try {
          await page.waitForSelector(this.SELECTORS.USERNAME, {
            visible: true,
            timeout: 10_000,
          });
          username = await page.$eval(
            this.SELECTORS.USERNAME,
            (el) => (el as HTMLElement).innerText
          );
        } catch (err) {
          console.log(
            `[${sessionId}] ⚠️ Could not extract username from profile page.`
          );
        }
      }

      // ── Final email fallback ──────────────────────────────────────────
      let emailValue: string =
        (session as any).__capturedEmail ?? extractedConfirmEmail ?? '';
      if (!emailValue) {
        emailValue = await page.evaluate(
          () =>
            localStorage.getItem('userEmail') ??
            localStorage.getItem('nike.email') ??
            ''
        );
      }

      // ── Log summary ───────────────────────────────────────────────────
      console.log('\n' + '='.repeat(60));
      console.log(`[${sessionId}] 🎉 EXTRACTION COMPLETE`);
      console.log('='.repeat(60));
      console.log(`📧 Email:    ${emailValue || '❌ Failed to capture'}`);
      console.log(`👤 Username: ${username || '❌ Failed to capture'}`);
      if (extractedAvatar) console.log(`🖼️  Avatar:   Captured ✅`);
      console.log(
        `🔑 Token:    ${capturedToken ? 'Captured ✅' : '❌ Failed to capture'}`
      );
      if (capturedToken) console.log(capturedToken);
      console.log('='.repeat(60) + '\n');

      const result: PuppeteerNikeAuthResult = {
        email: emailValue,
        token: capturedToken,
        username: username || '',
        avatar: extractedAvatar,
      };

      sseService.emit(sessionId, 'nrc-login-step', {
        step: 'success',
        sessionId,
      });
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

export const puppeteerSessionManager = (globalThis.__puppeteerSessionManager ??=
  new PuppeteerSessionManager());
