import { defineConfig, devices } from '@playwright/test'

// Smoke tests against a production build: `npm run build && npm run test:e2e`
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:3100', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: { command: 'npx next start -p 3100', url: 'http://localhost:3100', reuseExistingServer: true, timeout: 120_000 },
})
