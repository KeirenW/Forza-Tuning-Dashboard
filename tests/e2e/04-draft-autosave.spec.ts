import { test, expect, cleanStart, createCar, createBaselineTune, trackPageErrors } from './helpers/setup'

test.describe('Draft Autosave', () => {
  test.beforeEach(async ({ page }) => {
    await cleanStart(page)
    await createCar(page)
    await page.getByRole('button', { name: 'Toyota GR86' }).click()
    await createBaselineTune(page)
  })

  test('draft saved after 4s, banner shown on return, Restore works', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)

    // Change the tune name
    const nameInput = page.getByLabel('Tune name')
    await nameInput.fill('My Test Revision')

    // Wait for autosave (3s interval + buffer)
    await page.waitForTimeout(4200)

    // Navigate away to Garage
    await page.locator('#main-nav').getByRole('link', { name: 'Garage' }).click()
    await expect(page.getByRole('button', { name: 'Toyota GR86' })).toBeVisible()

    // Navigate back to the tune
    await page.getByRole('button', { name: 'Toyota GR86' }).click()
    await page.getByRole('link', { name: 'Open' }).click()

    // Draft banner should appear
    await expect(page.getByText('Unsaved draft found')).toBeVisible()

    // Click Restore
    await page.getByRole('button', { name: 'Restore' }).click()
    await expect(page.getByText('Draft restored')).toBeVisible()

    // Name should be restored
    await expect(page.locator('input[value="My Test Revision"]')).toBeVisible()

    assertNoErrors()
  })

  test('Discard clears draft banner without restoring values', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)

    await page.getByLabel('Tune name').fill('Discardable Name')
    await page.waitForTimeout(4200)
    await page.locator('#main-nav').getByRole('link', { name: 'Garage' }).click()
    await page.getByRole('button', { name: 'Toyota GR86' }).click()
    await page.getByRole('link', { name: 'Open' }).click()

    await expect(page.getByText('Unsaved draft found')).toBeVisible()
    await page.getByRole('button', { name: 'Discard' }).click()
    await expect(page.getByText('Unsaved draft found')).not.toBeVisible()

    // Name should revert to saved value, not the draft
    await expect(page.locator('input[value="Discardable Name"]')).not.toBeVisible()

    assertNoErrors()
  })

  test('draft key cleared from localStorage after Save Revision', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)

    // Get tuneId from URL
    const url = page.url()
    const tuneId = url.split('/tune/')[1]

    await page.getByLabel('Tune name').fill('Will Be Saved')
    await page.waitForTimeout(4200)

    // Verify draft exists
    const before = await page.evaluate((id) => localStorage.getItem(`draft:${id}`), tuneId)
    expect(before).not.toBeNull()

    await page.getByRole('button', { name: 'Save Revision' }).click()

    // After save, draft should be cleared
    const after = await page.evaluate((id) => localStorage.getItem(`draft:${id}`), tuneId)
    expect(after).toBeNull()

    assertNoErrors()
  })
})
