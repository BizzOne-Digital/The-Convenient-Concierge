import { expect, test } from '@playwright/test'

test('homepage renders hero, services and booking CTA without horizontal overflow', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Moving, Deliveries')
  await expect(page.getByRole('link', { name: 'Explore Moving' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Ready to Get/ })).toBeAttached()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(overflow).toBe(false)
})

test('services pages list the preserved services and limitation', async ({ page }) => {
  await page.goto('/services/moving')
  await expect(page.getByText('Furniture Removal for Staging')).toBeVisible()
  await expect(page.getByText(/We do not offer disassembly or assembly services/).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /Download Moving Checklist/ })).toHaveAttribute('href', '/documents/tcc-moving-checklist.pdf')
})

test('booking form reveals conditional fields and validates', async ({ page }) => {
  await page.goto('/booking?service=delivery')
  await expect(page.getByLabel('Pickup location')).toBeVisible()
  await page.locator('label:has(input[name="serviceType"][value="moving"])').click()
  await expect(page.getByLabel('Moving from')).toBeVisible()
  await page.getByRole('button', { name: /Request a Booking/ }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await expect(page.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true')
})

test('admin login page is reachable and not indexable', async ({ page }) => {
  const res = await page.goto('/admin/login')
  expect(res?.headers()['x-robots-tag']).toContain('noindex')
  await expect(page.getByRole('heading', { name: 'Admin sign in' })).toBeVisible()
  await expect(page.getByLabel('Password')).toHaveAttribute('type', 'password')
})

test('protected admin pages redirect to login', async ({ page }) => {
  await page.goto('/admin/bookings')
  await expect(page).toHaveURL(/\/admin\/login/)
})
