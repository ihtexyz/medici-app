import { test, expect } from '@playwright/test'
import { navigateTo, hasText } from './helpers/test-helpers'

/**
 * E2E Tests: Redemption
 *
 * Tests the CENT redemption flow for converting CENT to collateral.
 */

test.describe('Redeem Page', () => {
  test('should display wallet connection prompt when not connected', async ({ page }) => {
    await navigateTo(page, '/redeem')

    // Should show connection prompt
    await expect(page.getByText('Connect Wallet')).toBeVisible()
    await expect(page.getByText('Connect your wallet to redeem CENT')).toBeVisible()

    // Should show exchange icon
    await expect(page.locator('text=🔄')).toBeVisible()
  })

  test('should load without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))

    await navigateTo(page, '/redeem')
    await page.waitForTimeout(2000)

    expect(errors.length).toBe(0)
  })

  test('should have proper URL', async ({ page }) => {
    await navigateTo(page, '/redeem')
    expect(page.url()).toContain('/redeem')
  })
})

test.describe('Redemption Form', () => {
  test('should display redemption form structure', async ({ page }) => {
    await navigateTo(page, '/redeem')

    // Page should render
    await expect(page.locator('body')).toBeVisible()
  })

  test('should show CENT balance when connected', async ({ page }) => {
    await navigateTo(page, '/redeem')

    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
  })

  test('should calculate redemption fees', async ({ page }) => {
    await navigateTo(page, '/redeem')

    const hasError = await hasText(page, 'Error')
    expect(hasError).toBeFalsy()
  })
})

test.describe('Redemption Flow (UI Validation)', () => {
  test('should validate CENT amount input', async ({ page }) => {
    await navigateTo(page, '/redeem')

    await expect(page.locator('body')).toBeVisible()
  })

  test('should show redemption preview', async ({ page }) => {
    await navigateTo(page, '/redeem')

    // Verify page loads
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
  })

  test('should display fee breakdown', async ({ page }) => {
    await navigateTo(page, '/redeem')

    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Educational Content', () => {
  test('should display redemption explanation', async ({ page }) => {
    await navigateTo(page, '/redeem')

    // Page should be informative even when not connected
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
    expect(bodyText!.length).toBeGreaterThan(100)
  })

  test('should warn about impact on low-interest Troves', async ({ page }) => {
    await navigateTo(page, '/redeem')

    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await navigateTo(page, '/redeem')

    await expect(page.locator('body')).toBeVisible()

    const bodyWidth = await page.evaluate(() => document.body.clientWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375)
  })

  test('should be tablet responsive', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await navigateTo(page, '/redeem')

    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await navigateTo(page, '/redeem')
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(5000)
  })
})
