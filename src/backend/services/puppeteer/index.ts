import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
import type { Browser } from 'puppeteer';

// Register the stealth plugin
puppeteer.use(StealthPlugin());

export interface NikeAuthResult {
  email: string | null;
  token: string | null;
  username: string | null;
}

export interface CaptureOptions {
  headless?: boolean;
  userDataDir?: string;
  timeout?: number;
}

export class PuppeteerService {
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

  /**
   * Captures Nike authentication data (email, token, and username) by launching a browser
   * and monitoring network requests while the user logs in.
   */
  async captureNikeAuth(options: CaptureOptions = {}): Promise<NikeAuthResult> {
    const { headless = false, userDataDir, timeout = 0 } = options;

    const chromePath = process.env.CHROME_PATH ?? this.DEFAULT_CHROME_PATH;

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

      // --- SHARED STATE ---
      let capturedToken: string | null = null;
      let emailValue: string | null = null;

      // --- 1. SETUP NODE <-> BROWSER BRIDGE ---
      await page.exposeFunction('sendEmailToNode', (email: string) => {
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
        if (
          (url.includes('api.nike.com') || url.includes('unite.nike.com')) &&
          headers.authorization
        ) {
          capturedToken = headers.authorization;
        }

        // BACKUP: Capture Email from Network Payload
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
            if (possibleEmail && !emailValue) {
              console.log(
                `📡 network: Email captured from API Payload: ${possibleEmail}`
              );
              emailValue = possibleEmail;
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
        void request.continue();
      });

      console.log('🌐 Navigating to Login...');
      await page.goto(this.URLS.LOGIN, { waitUntil: 'domcontentloaded' });

      // --- 3. INJECT LISTENERS ---
      console.log('👀 Waiting for login form...');
      await page.waitForSelector(this.SELECTORS.EMAIL_INPUT, {
        visible: true,
        timeout: 60000,
      });

      await page.evaluate((selectors) => {
        const emailInput = document.querySelector(selectors.EMAIL_INPUT)!;
        const submitBtn = document.querySelector(selectors.NEXT_BUTTON);
        const form = document.querySelector(selectors.LOGIN_FORM);

        const capture = () => {
          if (emailInput && (emailInput as HTMLInputElement).value) {
            (window as any).sendEmailToNode(
              (emailInput as HTMLInputElement).value.trim()
            );
          }
        };

        if (form) form.addEventListener('submit', capture);
        if (submitBtn) {
          submitBtn.addEventListener('click', capture);
          submitBtn.addEventListener('mousedown', capture);
        }
      }, this.SELECTORS);

      console.log(
        '✅ Listeners attached. Please enter email and click Continue.'
      );

      // --- 4. WAIT FOR NAVIGATION ---
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout });

      // --- 5. FINAL CHECK ---
      emailValue ??= await page.evaluate(
        () =>
          localStorage.getItem('userEmail') ??
          localStorage.getItem('nike.email')
      );

      console.log('✅ Login Detected! Navigating to Profile...');

      // --- 6. NAVIGATE TO PROFILE ---
      await page.goto(this.URLS.PROFILE, {
        waitUntil: 'networkidle2',
        timeout,
      });

      // --- 7. EXTRACT USERNAME ---
      console.log('👀 Waiting for username...');
      await page.waitForSelector(this.SELECTORS.USERNAME, {
        visible: true,
        timeout,
      });
      const username = await page.$eval(
        this.SELECTORS.USERNAME,
        (el) => (el as HTMLElement).innerText
      );

      console.log('\n' + '='.repeat(60));
      console.log('🎉 EXTRACTION COMPLETE');
      console.log('='.repeat(60));
      console.log(`📧 User Email:    ${emailValue ?? '❌ Failed to capture'}`);
      console.log(`👤 Username:      ${username}`);
      console.log(
        `🔑 Bearer Token:  ${capturedToken ? 'Captured' : 'Waiting...'}`
      );
      if (capturedToken) console.log(capturedToken);
      console.log('='.repeat(60) + '\n');

      return {
        email: emailValue ?? '',
        token: capturedToken,
        username: username,
      };
    } catch (err: any) {
      console.error('❌ Error in captureNikeAuth:', err.message);
      throw err; // rethrow the error after logging
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

export const puppeteerService = new PuppeteerService();
