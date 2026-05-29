import AxeBuilder from '@axe-core/playwright'
import { test, expect, cleanStart, trackPageErrors } from './helpers/setup'

const BASE = '/Forza-Tuning-Dashboard'

test.describe('Foundation', () => {
  test('app loads with dark theme and correct navbar', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    await page.goto(BASE + '/')
    await expect(page.locator('main')).not.toBeEmpty()

    // Dark theme applied to <html>
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-bs-theme')
    )
    expect(theme).toBe('dark')

    // Brand text
    await expect(page.getByText('⏱ FH6 Tune Tracker')).toBeVisible()

    // Navbar links
    await expect(page.getByRole('link', { name: 'Garage' })).toBeVisible()

    // Export / Import buttons
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Import' })).toBeVisible()

    assertNoErrors()
  })

  test('garage empty state shown when no cars', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    await cleanStart(page)

    await expect(page.getByText('No cars yet')).toBeVisible()
    await expect(page.getByRole('button', { name: '+ Add Car' }).first()).toBeVisible()

    assertNoErrors()
  })

  test('garage page has no critical accessibility violations', async ({ page }) => {
    await cleanStart(page)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('.modal-backdrop') // Bootstrap backdrop has known contrast issues in dark mode
      .analyze()
    expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0)
  })
})
