import { test as baseTest, expect, type Page } from '@playwright/test'

const BASE = '/Forza-Tuning-Dashboard'

/** Clear all app state and navigate to Garage before each test */
export async function cleanStart(page: Page) {
  // Navigate first so localStorage is on the right origin
  await page.goto(BASE + '/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()
  await expect(page.locator('main')).not.toBeEmpty()
}

/** Assert no console errors or failed requests occurred during a test */
export function trackPageErrors(page: Page): () => void {
  const errors: string[] = []

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`)
  })
  page.on('pageerror', err => {
    errors.push(`pageerror: ${err.message}`)
  })
  page.on('requestfailed', req => {
    // Ignore known optional resources (e.g. devtools noise)
    const url = req.url()
    if (!url.includes('hot-update') && !url.includes('chrome-extension')) {
      errors.push(`requestfailed: ${url}`)
    }
  })

  return () => {
    expect(errors, `Page errors detected:\n${errors.join('\n')}`).toHaveLength(0)
  }
}

/** Assert Zustand persisted stores are valid JSON in localStorage */
export async function assertStoreIntegrity(page: Page) {
  const garageRaw = await page.evaluate(() => localStorage.getItem('garage-store'))
  const tuneRaw   = await page.evaluate(() => localStorage.getItem('tune-store'))
  if (garageRaw) expect(() => JSON.parse(garageRaw), 'garage-store corrupt').not.toThrow()
  if (tuneRaw)   expect(() => JSON.parse(tuneRaw), 'tune-store corrupt').not.toThrow()
}

/** Fill and submit the Add Car modal */
export async function createCar(
  page: Page,
  opts: { manufacturer?: string; model?: string; carClass?: string; drivetrain?: string } = {}
) {
  const {
    manufacturer = 'Toyota',
    model = 'GR86',
    carClass = 'A',
    drivetrain = 'RWD',
  } = opts

  await page.getByRole('button', { name: '+ Add Car' }).first().click()
  await page.getByLabel('Manufacturer').fill(manufacturer)
  await page.getByLabel('Model').fill(model)
  await page.getByLabel('Class').selectOption(carClass)
  await page.getByLabel('Drivetrain').selectOption(drivetrain)
  await page.getByRole('button', { name: 'Save' }).click()
  // Wait for modal to close
  await expect(page.getByRole('button', { name: 'Save' })).not.toBeVisible()
}

/** Navigate to CarPage and create a baseline tune, ending up on TunePage */
export async function createBaselineTune(page: Page) {
  await page.getByRole('button', { name: 'New Tune' }).click()
  await expect(page.locator('main')).not.toBeEmpty()
}

/**
 * Extended test fixture that automatically captures all browser console output
 * (logs, warnings, errors, page errors, failed requests) and attaches it to the
 * Playwright HTML report whenever a test fails. No changes required in spec files.
 */
const test = baseTest.extend<{ _captureConsole: void }>({
  _captureConsole: [async ({ page }, use, testInfo) => {
    const lines: string[] = []

    page.on('console', msg => {
      lines.push(`[${msg.type().toUpperCase()}] ${msg.text()}`)
    })
    page.on('pageerror', err => {
      lines.push(`[PAGEERROR] ${err.message}`)
      if (err.stack) lines.push(err.stack)
    })
    page.on('requestfailed', req => {
      const url = req.url()
      if (!url.includes('hot-update') && !url.includes('chrome-extension')) {
        lines.push(`[REQUESTFAILED] ${url} — ${req.failure()?.errorText ?? 'unknown'}`)
      }
    })

    await use()

    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach('browser-console', {
        body: lines.length > 0 ? lines.join('\n') : '(no browser console output captured)',
        contentType: 'text/plain',
      })
    }
  }, { auto: true }],
})

export { test, expect }
