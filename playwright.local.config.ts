import { defineConfig, devices } from '@playwright/test'

/**
 * Local Playwright config that reuses an already running dev server.
 * Start the app yourself (npm run dev -- --hostname 127.0.0.1 --port 3031)
 * before running these tests.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60 * 1000,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://127.0.0.1:3031',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // No webServer command here; assumes dev server already running.
})
