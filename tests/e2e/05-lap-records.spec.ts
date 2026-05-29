import { test, expect, cleanStart, createCar, createBaselineTune, trackPageErrors, assertStoreIntegrity } from './helpers/setup'

const SONI_LAP = '1:42.381'
const FASTER_LAP = '1:41.900'

test.describe('Lap Records & PB Assignment', () => {
  test.beforeEach(async ({ page }) => {
    await cleanStart(page)
    await createCar(page)
    await page.getByRole('button', { name: 'Toyota GR86' }).click()
    await createBaselineTune(page)
  })

  test('valid lap time entered and displayed correctly', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    const input = page.getByPlaceholder('m:ss.sss').first()
    await input.fill(SONI_LAP)
    await input.blur()
    await expect(input).toHaveValue(SONI_LAP)
    await expect(input).not.toHaveClass(/is-invalid/)
    assertNoErrors()
  })

  test('invalid lap time shows error, reverts on blur', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    const input = page.getByPlaceholder('m:ss.sss').first()
    await input.fill(SONI_LAP)
    await input.blur()

    // Now enter invalid
    await input.fill('abc')
    await input.blur()

    await expect(page.getByText(/Invalid format/i)).toBeVisible()
    // Should revert to last valid
    await expect(input).toHaveValue(SONI_LAP)
    assertNoErrors()
  })

  test('clear button (×) removes lap entry', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    const input = page.getByPlaceholder('m:ss.sss').first()
    await input.fill(SONI_LAP)
    await input.blur()

    // Click clear button
    await page.getByRole('button', { name: '×' }).first().click()
    await expect(input).toHaveValue('')
    assertNoErrors()
  })

  test('save with lap — Track PBs table on CarPage shows time and tune name', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    const input = page.getByPlaceholder('m:ss.sss').first()
    await input.fill(SONI_LAP)
    await input.blur()
    await page.getByRole('button', { name: 'Save Revision' }).click()

    await expect(page.getByText('Track PBs')).toBeVisible()
    await expect(page.getByText(SONI_LAP).first()).toBeVisible()

    await assertStoreIntegrity(page)
    assertNoErrors()
  })

  test('faster lap on duplicate tune — PB badge migrates', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)

    // Enter lap and save
    const input = page.getByPlaceholder('m:ss.sss').first()
    await input.fill(SONI_LAP)
    await input.blur()
    await page.getByRole('button', { name: 'Save Revision' }).click()

    // Open tune and duplicate
    await page.getByRole('link', { name: 'Open' }).click()
    await page.getByRole('button', { name: 'Duplicate' }).click()

    // Enter faster lap on duplicate
    const input2 = page.getByPlaceholder('m:ss.sss').first()
    await input2.fill(FASTER_LAP)
    await input2.blur()
    await page.getByRole('button', { name: 'Save Revision' }).click()

    // Timeline should now show "Baseline V2" with PB badge
    const v2Node = page.locator('.timeline-node', { hasText: 'Baseline V2' })
    await expect(v2Node.getByText('★ PB')).toBeVisible()

    // Original "Baseline" should no longer have PB
    const baseNode = page.locator('.timeline-node', { hasText: 'Baseline' }).first()
    await expect(baseNode.getByText('★ PB')).not.toBeVisible()

    await assertStoreIntegrity(page)
    assertNoErrors()
  })
})
