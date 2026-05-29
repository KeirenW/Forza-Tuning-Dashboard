import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import { test, expect, cleanStart, createCar, trackPageErrors, assertStoreIntegrity } from './helpers/setup'

test.describe('Export / Import', () => {
  test.beforeEach(async ({ page }) => {
    await cleanStart(page)
    await createCar(page, { manufacturer: 'Toyota', model: 'GR86', carClass: 'A', drivetrain: 'RWD' })
  })

  test('Export downloads a valid JSON file with schemaVersion 1', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export' }).click()
    const download = await downloadPromise

    // Filename matches expected pattern
    expect(download.suggestedFilename()).toMatch(/^fh6-tunes-\d{4}-\d{2}-\d{2}\.json$/)

    // Save and read the file
    const tmpPath = path.join(os.tmpdir(), download.suggestedFilename())
    await download.saveAs(tmpPath)
    const content = fs.readFileSync(tmpPath, 'utf-8')
    const parsed = JSON.parse(content)

    expect(parsed.schemaVersion).toBe(1)
    expect(Array.isArray(parsed.cars)).toBe(true)
    expect(Array.isArray(parsed.tunes)).toBe(true)
    expect(parsed.cars.length).toBeGreaterThan(0)

    // "Exported successfully" toast
    await expect(page.getByText('Exported successfully')).toBeVisible()

    fs.unlinkSync(tmpPath)
    assertNoErrors()
  })

  test('Import replaces data after confirmation, success toast fires', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)

    // Export first to get a valid file
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export' }).click()
    const download = await downloadPromise
    const tmpPath = path.join(os.tmpdir(), download.suggestedFilename())
    await download.saveAs(tmpPath)

    // Add a junk car
    await page.getByRole('button', { name: '+ Add Car' }).first().click()
    await page.getByLabel('Manufacturer').fill('Junk')
    await page.getByLabel('Model').fill('Car')
    await page.getByLabel('Class').selectOption('D')
    await page.getByLabel('Drivetrain').selectOption('FWD')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('button', { name: 'Junk Car' })).toBeVisible()

    // Import the original export
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(tmpPath)

    // Confirmation modal should appear
    await expect(page.getByText('Replace all data?')).toBeVisible()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()

    // Junk car gone
    await expect(page.getByRole('button', { name: 'Junk Car' })).not.toBeVisible()
    // Original car still present
    await expect(page.getByRole('button', { name: 'Toyota GR86' })).toBeVisible()
    // Success toast
    await expect(page.getByText('Data imported successfully')).toBeVisible()

    await assertStoreIntegrity(page)
    fs.unlinkSync(tmpPath)
    assertNoErrors()
  })

  test('Import with corrupted file shows danger toast, no modal', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)

    // Write a bad file
    const tmpPath = path.join(os.tmpdir(), 'bad-import.json')
    fs.writeFileSync(tmpPath, 'this is not json at all')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(tmpPath)

    // Danger toast
    await expect(page.getByText(/Import failed/i)).toBeVisible()
    // No modal
    await expect(page.getByText('Replace all data?')).not.toBeVisible()
    // Data untouched
    await expect(page.getByRole('button', { name: 'Toyota GR86' })).toBeVisible()

    fs.unlinkSync(tmpPath)
    assertNoErrors()
  })

  test('Import with wrong schemaVersion shows danger toast', async ({ page }) => {
    const tmpPath = path.join(os.tmpdir(), 'wrong-schema.json')
    fs.writeFileSync(tmpPath, JSON.stringify({
      schemaVersion: 999,
      exportedAt: new Date().toISOString(),
      cars: [],
      tunes: [],
    }))

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(tmpPath)

    await expect(page.getByText(/Import failed/i)).toBeVisible()
    await expect(page.getByText('Replace all data?')).not.toBeVisible()

    fs.unlinkSync(tmpPath)
  })
})
