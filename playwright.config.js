import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:8797';

export default defineConfig({
  testDir: './e2e',
  use: { baseURL },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'narrow', use: { viewport: { width: 320, height: 720 } } },
  ],
  webServer: {
    command: 'npm run dev -- --ip 127.0.0.1 --port 8797',
    url: baseURL,
  },
});
