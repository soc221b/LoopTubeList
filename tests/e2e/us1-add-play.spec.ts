import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || '/'

test('add a video and play it', async ({ page }) => {
  await page.goto(BASE)
  await page.getByLabel('YouTube URL').fill('https://youtu.be/dQw4w9WgXcQ')
  await page.getByRole('button', { name: 'Add' }).click()
  // wait for Play button to appear and click it
  const play = page.locator('button[aria-label="select"]')
  await expect(play).toHaveCount(1)
  await play.click()
  // expect an iframe with youtube embed src
  const iframe = page.locator('iframe')
  await expect(iframe).toHaveAttribute('src', /youtube\.com\/embed\//)
})
