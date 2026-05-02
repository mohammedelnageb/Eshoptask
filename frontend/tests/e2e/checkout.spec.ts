import { expect, test } from '@playwright/test'

test('customer can browse products and reach checkout', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByText(/products|techshop/i).first()).toBeVisible()
  await page.getByRole('link', { name: /cart/i }).click()
  await expect(page).toHaveURL(/cart/)
})
