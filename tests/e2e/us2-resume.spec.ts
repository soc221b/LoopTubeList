import { test, expect } from '@playwright/test'

// Seeds localStorage with a watch record and verifies the player starts at that position

test('resume plays from saved position', async ({ page, baseURL }) => {
  const base = baseURL || 'http://localhost:5173'
  await page.goto(base)
  await page.evaluate(() => {
    const key = 'ltl:v1:watch:dQw4w9WgXcQ'
    const record = { videoId: 'dQw4w9WgXcQ', last_position_seconds: 37, last_watched_at: new Date().toISOString() }
    localStorage.setItem(key, JSON.stringify(record))
  })
  await page.reload()
  await page.getByLabel('YouTube URL').fill('https://youtu.be/dQw4w9WgXcQ')
  await page.getByRole('button', { name: 'Add' }).click()
  const play = page.locator('button[aria-label="select"]')
  await expect(play).toHaveCount(1)
  await play.click()
  const iframe = page.locator('iframe')
  await expect(iframe).toHaveAttribute('src', /start=37/)
})
