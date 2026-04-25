import { defineConfig } from '@playwright/test';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const testsDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(testsDir, '..');
const backendDir = resolve(repoRoot, 'backend');
const frontendDir = resolve(repoRoot, 'frontend');

export default defineConfig({
  testDir: './e2e',   // ONLY this folder

  testMatch: /.*\.spec\.js/, // ONLY .spec.js files

  webServer: [
    {
      command: 'npm run dev',
      cwd: backendDir,
      port: 5000,
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'npm run dev',
      cwd: frontendDir,
      port: 5173,
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],

  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
});