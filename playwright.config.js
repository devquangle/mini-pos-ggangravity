import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Chạy tuần tự để tránh xung đột dữ liệu trên json-server khi test E2E
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm run api',
      url: 'http://localhost:3000/products',
      reuseExistingServer: !process.env.CI,
      timeout: 10 * 1000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 10 * 1000,
    }
  ]
});
