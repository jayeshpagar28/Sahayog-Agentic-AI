import * as fs from 'fs';
import * as path from 'path';
import { defineConfig, devices } from '@playwright/test';

/**
 * Loads `.env.local` into process.env for local runs.
 *
 * Credentials and third-party fixtures (the CBS account, the staff code, the introducer's real
 * name) must not be committed — the introducer name is a real person's, and the project forbids
 * recording applicant PII. Locally they live in a gitignored file; in CI they arrive as GitHub
 * Secrets/Variables. Existing environment variables always win, so an explicit
 * `STAFF_MUTABLE_SEED_ID=... npx playwright test` still overrides the file.
 *
 * Hand-parsed rather than pulling in `dotenv` — this needs no dependency and the format is
 * KEY=VALUE with # comments.
 */
function loadLocalEnv(): void {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadLocalEnv();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'https://sahyogagentweb.drutam.in:9634',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    {
      name: 'chromium',
      // The account-creation flow runs under chromium-camera (it needs the fake video device
      // for the signature capture) and creates a real application, so it is excluded from the
      // default project's sweep and invoked deliberately by path (`npm run staff:create`).
      testIgnore: /(staff-account-creation|silver-savings-(individual|joint|minor)|normal-savings-(individual|joint|minor))\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/.auth/user.json' },
      dependencies: ['setup'],
    },

    /**
     * The full account-creation journey.
     *
     * The Applicant Photo step offers no <input type="file"> at all — capture is the only path
     * for both the photo and the signature — so a fake video device is mandatory. Two
     * prerequisites, both learned the hard way during exploration: the device AND the
     * permissions are required (permissions alone are not enough), and the matching browser
     * build must be installed (`npx playwright install chromium`).
     */
    {
      name: 'chromium-camera',
      testMatch: /(staff-account-creation|silver-savings-(individual|joint|minor)|normal-savings-(individual|joint|minor))\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/user.json',
        permissions: ['camera', 'geolocation'],
        geolocation: { latitude: 19.076, longitude: 72.8777 },
        launchOptions: {
          args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
        },
      },
      dependencies: ['setup'],
    },


    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: 'tests/.auth/user.json' },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: 'tests/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
});

