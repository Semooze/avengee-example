import { defineConfig } from '@playwright/test';

// A dedicated port and database keep the suite away from any `npm run dev`
// you already have open on :3000. Reusing a long-running dev server was the
// cause of flaky ERR_CONNECTION_REFUSED runs when that server went away
// mid-suite.
const port = Number(process.env.E2E_PORT ?? 3210);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests',
  testMatch: 'e2e.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: { baseURL, headless: true },
  webServer: {
    command: `rm -f e2e.db && npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    env: { TURSO_DATABASE_URL: 'file:./e2e.db' },
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
