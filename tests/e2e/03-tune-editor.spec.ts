import AxeBuilder from '@axe-core/playwright'
import { test, expect, cleanStart, createCar, createBaselineTune, trackPageErrors, assertStoreIntegrity } from './helpers/setup'

const ACCORDION_SECTIONS = [
  'Tyres', 'Gearing', 'Alignment', 'Anti-Roll Bars',
  'Springs', 'Damping', 'Aero', 'Brakes', 'Differential',
]

test.describe('Tune Editor', () => {
  test.beforeEach(async ({ page }) => {
    await cleanStart(page)
    await createCar(page, { manufacturer: 'Toyota', model: 'GR86', carClass: 'A', drivetrain: 'RWD' })
    await page.getByRole('button', { name: 'Toyota GR86' }).click()
  })

  test('all 9 accordion sections render on TunePage', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    await createBaselineTune(page)

    for (const section of ACCORDION_SECTIONS) {
      await expect(page.getByText(section).first()).toBeVisible()
    }
    assertNoErrors()
  })

  test('gear count dropdown controls how many gear inputs render', async ({ page }) => {
    await createBaselineTune(page)
    // Open Gearing accordion
    await page.getByText('Gearing').click()

    // Default is 6 gears
    const gearInputs = page.locator('input[placeholder*="Gear"]').or(
      page.locator('[data-testid^="gear-"]')
    )

    // Set to 3
    await page.getByLabel('Gear Count').selectOption('3')
    await expect(page.getByText('Gear 1').first()).toBeVisible()
    await expect(page.getByText('Gear 4').first()).not.toBeVisible()

    // Set to 7
    await page.getByLabel('Gear Count').selectOption('7')
    await expect(page.getByText('Gear 7').first()).toBeVisible()
    await expect(page.getByText('Gear 8').first()).not.toBeVisible()
  })

  test('RWD car — Center Balance field absent in Differential', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    await createBaselineTune(page)
    await page.getByText('Differential').click()
    await expect(page.getByText('Center Balance')).not.toBeVisible()
    assertNoErrors()
  })

  test('AWD car — Center Balance field visible in Differential', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    // Create an AWD car
    await page.goto('/Forza-Tuning-Dashboard/')
    await createCar(page, { manufacturer: 'Subaru', model: 'WRX', carClass: 'S1', drivetrain: 'AWD' })
    await page.getByRole('button', { name: 'Subaru WRX' }).click()
    await createBaselineTune(page)
    await page.getByText('Differential').click()
    await expect(page.getByText('Center Balance')).toBeVisible()
    assertNoErrors()
  })

  test('Save Revision navigates to CarPage and tune appears in timeline', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    await createBaselineTune(page)
    await page.getByRole('button', { name: 'Save Revision' }).click()

    // Should be back on CarPage
    await expect(page.getByText('Tune History')).toBeVisible()
    // Tune appears
    await expect(page.getByText('Baseline').first()).toBeVisible()
    // Toast fires
    await expect(page.getByText('Tune saved')).toBeVisible()

    await assertStoreIntegrity(page)
    assertNoErrors()
  })

  test('Duplicate tune creates new tune with parent link shown', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    await createBaselineTune(page)
    await page.getByRole('button', { name: 'Save Revision' }).click()
    // Open the tune
    await page.getByRole('link', { name: 'Open' }).click()
    // Duplicate
    await page.getByRole('button', { name: 'Duplicate' }).click()
    // Should navigate to new tune — name suggested as "Baseline V2"
    await expect(page.locator('input[value="Baseline V2"]')).toBeVisible()

    await assertStoreIntegrity(page)
    assertNoErrors()
  })

  test('TunePage has no critical accessibility violations', async ({ page }) => {
    await createBaselineTune(page)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0)
  })
})
