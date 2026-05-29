import { test, expect, cleanStart, createCar, trackPageErrors, assertStoreIntegrity } from './helpers/setup'

const BASE = '/Forza-Tuning-Dashboard'

test.describe('Garage — Car CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await cleanStart(page)
  })

  test('create a car — card appears with class and drivetrain badges', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    await createCar(page, { manufacturer: 'Subaru', model: 'BRZ', carClass: 'A', drivetrain: 'RWD' })

    await expect(page.getByRole('button', { name: 'Subaru BRZ' })).toBeVisible()
    await expect(page.getByText('A').first()).toBeVisible()
    await expect(page.getByText('RWD').first()).toBeVisible()

    await assertStoreIntegrity(page)
    assertNoErrors()
  })

  test('edit a car — modal pre-populated and changes persist', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    await createCar(page, { manufacturer: 'Honda', model: 'Civic', carClass: 'B', drivetrain: 'FWD' })

    // Click edit button
    await page.getByRole('button', { name: 'Edit car' }).click()
    await expect(page.getByLabel('Manufacturer')).toHaveValue('Honda')
    await expect(page.getByLabel('Model')).toHaveValue('Civic')

    // Change model
    await page.getByLabel('Model').fill('Civic Type R')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Civic Type R')).toBeVisible()

    await assertStoreIntegrity(page)
    assertNoErrors()
  })

  test('delete a car — confirmation modal shown, car removed, toast fires', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    await createCar(page, { manufacturer: 'Mazda', model: 'MX-5', carClass: 'C', drivetrain: 'RWD' })

    await page.getByRole('button', { name: 'Delete car' }).click()
    // Confirmation modal
    await expect(page.getByText('Delete Car')).toBeVisible()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()

    await expect(page.getByRole('button', { name: 'Mazda MX-5' })).not.toBeVisible()
    // Toast
    await expect(page.getByText(/deleted/i)).toBeVisible()

    await assertStoreIntegrity(page)
    assertNoErrors()
  })

  test('car with no laps shows — for all tracks on card', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)
    await createCar(page)

    // Each track row on the card shows an em-dash
    const dashes = page.locator('.card').getByText('—')
    await expect(dashes.first()).toBeVisible()

    assertNoErrors()
  })

  test('delete car cascades and removes its tunes from store', async ({ page }) => {
    await createCar(page, { manufacturer: 'Nissan', model: 'GT-R', carClass: 'S1', drivetrain: 'AWD' })
    await page.getByRole('button', { name: 'Nissan GT-R' }).click()
    await page.getByRole('button', { name: 'Create Baseline Tune' }).click()
    // Save the tune
    await page.getByRole('button', { name: 'Save Revision' }).click()
    // Back on CarPage → go back to Garage
    await page.locator('#main-nav').getByRole('link', { name: 'Garage' }).click()

    // Delete the car
    await page.getByRole('button', { name: 'Delete car' }).click()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()

    // Store should have no tunes left
    const tuneRaw = await page.evaluate(() => localStorage.getItem('tune-store'))
    const tuneStore = JSON.parse(tuneRaw!)
    expect(tuneStore.state.tunes).toHaveLength(0)
  })
})
