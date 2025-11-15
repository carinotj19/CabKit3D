import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.VITE_PORT || 5173);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${PORT}`;
const defaultServerCommand =
  process.platform === 'win32'
    ? `cmd /c "npm run dev -- --host 127.0.0.1 --port ${PORT}"`
    : `npm run dev -- --host 127.0.0.1 --port ${PORT}`;
const WEB_SERVER_COMMAND = process.env.PLAYWRIGHT_WEB_SERVER || defaultServerCommand;

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    video: { mode: 'on', size: { width: 1280, height: 720 } },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: WEB_SERVER_COMMAND,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
