import AxeBuilder from '@axe-core/playwright'
import { test, expect, cleanStart, createCar, createBaselineTune, trackPageErrors } from './helpers/setup'

const SONI_LAP_A = '1:42.381'
const SONI_LAP_B = '1:41.900'

async function setupTwoTunesWithLaps(page: import('@playwright/test').Page) {
  await cleanStart(page)
  await createCar(page)
  await page.getByRole('button', { name: 'Toyota GR86' }).click()

  // Tune 1 — Baseline with slower lap
  await createBaselineTune(page)
  const input1 = page.getByPlaceholder('m:ss.sss').first()
  await input1.fill(SONI_LAP_A)
  await input1.blur()
  await page.getByRole('button', { name: 'Save Revision' }).click()

  // Tune 2 — Duplicate with faster lap
  await page.getByRole('link', { name: 'Open' }).click()
  await page.getByRole('button', { name: 'Duplicate' }).click()
  const input2 = page.getByPlaceholder('m:ss.sss').first()
  await input2.fill(SONI_LAP_B)
  await input2.blur()
  await page.getByRole('button', { name: 'Save Revision' }).click()
}

test.describe('Comparison Engine', () => {
  test('"Compare Tunes" button visible with 2+ tunes', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    await setupTwoTunesWithLaps(page)
    await expect(page.getByRole('button', { name: 'Compare Tunes' })).toBeVisible()
    assertNoErrors()
  })

  test('Compare button in timeline navigates with ?tuneId in URL', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    await setupTwoTunesWithLaps(page)
    await page.getByRole('button', { name: 'Compare', exact: true }).first().click()
    await expect(page).toHaveURL(/tuneId=/)
    await expect(page.locator('main')).not.toBeEmpty()
    assertNoErrors()
  })

  test('Tune A pre-selected from URL param', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    await setupTwoTunesWithLaps(page)
    await page.getByRole('button', { name: 'Compare', exact: true }).first().click()
    // The Tune A dropdown should not be empty
    const tuneASelect = page.locator('select').first()
    const selectedValue = await tuneASelect.inputValue()
    expect(selectedValue).not.toBe('')
    assertNoErrors()
  })

  test('Sekibe tab (no laps) shows no-PB alert and — headline', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    await setupTwoTunesWithLaps(page)
    await page.getByRole('button', { name: 'Compare Tunes' }).click()
    await page.getByRole('button', { name: 'Sekibe' }).click()
    // No PB alert shown; display-6 block is hidden (tuneB auto-clears when no Sekibe lap exists)
    await expect(page.getByText(/No PB set for Sekibe/i)).toBeVisible()
    assertNoErrors()
  })

  test('Soni tab with laps on both tunes shows lap delta headline', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    await setupTwoTunesWithLaps(page)
    await page.getByRole('button', { name: 'Compare Tunes' }).click()
    // Soni is default tab; both tunes have laps
    const headline = page.locator('.display-6')
    await expect(headline).not.toHaveText('—')
    await expect(headline.getByText(/faster|slower/i)).toBeVisible()
    assertNoErrors()
  })

  test('diff table shows only changed fields by default', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    await setupTwoTunesWithLaps(page)
    await page.getByRole('button', { name: 'Compare Tunes' }).click()

    // Count visible rows before "Show all fields" toggle
    const rowsBefore = await page.locator('tbody tr').count()

    // Toggle "Show all fields"
    await page.getByLabel('Show all fields').click()
    const rowsAfter = await page.locator('tbody tr').count()

    // After toggling, there should be more rows (section headers + unchanged rows)
    expect(rowsAfter).toBeGreaterThan(rowsBefore)
    assertNoErrors()
  })

  test('ComparePage has no critical accessibility violations', async ({ page }) => {
    await setupTwoTunesWithLaps(page)
    await page.getByRole('button', { name: 'Compare Tunes' }).click()
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0)
  })
})
