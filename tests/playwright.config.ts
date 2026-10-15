import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './',
  timeout: 45000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'off',
    video: 'off',
    screenshot: 'off',
  },
  projects: [
    {
      name: 'Desktop 1440',
      use: {
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'Laptop 1024',
      use: {
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'Tablet 768',
      use: {
        viewport: { width: 768, height: 1024 },
      },
    },
  ],
});
