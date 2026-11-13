import { expect, test } from '@playwright/test'

test('homepage renders hero, services and booking CTA without horizontal overflow', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Toronto Moving Services, Furniture Delivery & Everyday Concierge Help')
  await expect(page.getByRole('link', { name: 'Request a Free Quote' })).toHaveAttribute('href', '/booking')
  await expect(page.getByRole('link', { name: 'Call Now' })).toHaveAttribute('href', /^tel:\+1\d{10}$/)
  await expect(page.getByRole('link', { name: 'Explore Moving' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Ready to Get/ })).toBeAttached()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(overflow).toBe(false)
})

test('services pages list the preserved services and limitation', async ({ page }) => {
  await page.goto('/services/moving')
  await expect(page.getByText('Furniture assembly and disassembly', { exact: true })).toBeVisible()
  await expect(page.getByText(/do not offer/i)).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Download Moving Checklist/ })).toHaveAttribute('href', '/documents/tcc-moving-checklist.pdf')
})

test('booking form reveals conditional fields and validates', async ({ page }) => {
  await page.goto('/booking?service=delivery')
  await expect(page.getByLabel('Pickup location')).toBeVisible()
  await page.locator('label:has(input[name="serviceType"][value="moving"])').click()
  await expect(page.getByLabel('Pickup address')).toBeVisible()
  await page.getByRole('button', { name: /Request a Booking/ }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await expect(page.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true')
})

test('old WordPress URLs redirect permanently to their new pages; unmapped ones 404', async ({ request }) => {
  const cases: [string, string][] = [
    ['/new-order-page/', '/booking'],
    ['/new-order-page/moving-form/', '/booking?service=moving'],
    ['/order-forms-standard-service/deliveries-ss/', '/booking?service=delivery'],
    ['/order-forms-es/grocery-form-es', '/booking?service=tasks'],
    ['/wp-content/uploads/2022/03/1.TCC-Moving-Checklist.pdf', '/documents/tcc-moving-checklist.pdf'],
  ]
  for (const [from, to] of cases) {
    // Follow the chain by hand: every hop must be permanent (301/308) and it must end on the mapped page.
    let url = from
    for (let hop = 0; hop < 3 && url !== to; hop++) {
      const res = await request.get(url, { maxRedirects: 0 })
      expect([301, 308], `${url} (from ${from})`).toContain(res.status())
      url = res.headers().location ?? ''
    }
    expect(url, from).toBe(to)
    expect((await request.get(to)).status(), to).toBe(200)
  }
  for (const gone of ['/new-order-page/lcbo-beer-store-list-form/', '/my-account/'])
    expect((await request.get(gone)).status(), gone).toBe(404)
})

test('privacy policy is linked from the footer and forms', async ({ page }) => {
  await page.goto('/contact')
  await expect(page.locator('form').getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy-policy')
  await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy Policy' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy Policy')
  await expect(page.getByText('Privacy Contact: Marc Williams')).toBeVisible()
  await expect(page.getByText(/stored by our service providers in the United States/)).toBeVisible()
  await page.goto('/booking')
  await expect(page.locator('form').getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy-policy')
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
