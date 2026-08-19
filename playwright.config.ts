import { defineConfig, devices } from '@playwright/test';

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
      // Excluded from routine runs:
      //  - applicant-photo: needs the fake video device supplied by chromium-camera below.
      //  - seed-application-builder: NOT a regression test. It creates a real application and
      //    sends real SMS to a real handset, consuming attempt budgets capped at 3. Run it
      //    deliberately by path, never as part of a suite sweep.
      testIgnore: /(applicant-photo|staff-salary-journey|seed-application-builder)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/.auth/user.json' },
      dependencies: ['setup'],
    },

    /**
     * Camera-dependent specs (STAFF_TS001's Applicant Photo step).
     *
     * The Applicant Photo step offers no <input type="file"> at all — capture is the only
     * path for both the photo and the signature — so a fake video device is mandatory.
     * Two prerequisites, both learned the hard way during exploration: the device AND the
     * permissions are required (permissions alone are not enough), and the matching browser
     * build must be installed.
     */
    {
      name: 'chromium-camera',
      testMatch: /(applicant-photo|staff-salary-journey)\.spec\.ts/,
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

    /**
     * Seed builder — deliberately its own project.
     *
     * It is excluded from `chromium` via testIgnore so a suite sweep can never create a real
     * application or send real SMS. But testIgnore applies even when the file is named
     * explicitly, so without a project of its own the builder becomes unrunnable ("No tests
     * found"). This project is the single, explicit way to invoke it.
     */
    {
      name: 'seed-builder',
      testMatch: /seed-application-builder\.spec\.ts/,
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

