import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120000,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:5173' },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
})
