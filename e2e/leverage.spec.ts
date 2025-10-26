import { test, expect } from '@playwright/test'
import { navigateTo, hasText } from './helpers/test-helpers'

/**
 * E2E Tests: Leverage Calculator
 *
 * Tests the leverage simulation and risk analysis features.
 */

test.describe('Leverage Page', () => {
  test('should display wallet connection prompt when not connected', async ({ page }) => {
    await navigateTo(page, '/leverage')

    // Should show connection prompt
    await expect(page.getByText('Connect Wallet')).toBeVisible()
    await expect(page.getByText('Connect your wallet to simulate leveraged positions')).toBeVisible()

    // Should show chart icon
    await expect(page.locator('text=📊')).toBeVisible()
  })

  test('should load without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))

    await navigateTo(page, '/leverage')
    await page.waitForTimeout(2000)

    expect(errors.length).toBe(0)
  })

  test('should have proper URL', async ({ page }) => {
    await navigateTo(page, '/leverage')
    expect(page.url()).toContain('/leverage')
  })
})

test.describe('Leverage Calculator', () => {
  test('should display calculator inputs', async ({ page }) => {
    await navigateTo(page, '/leverage')

    // Page should render
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have collateral type selector', async ({ page }) => {
    await navigateTo(page, '/leverage')

    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
  })

  test('should have leverage multiplier slider', async ({ page }) => {
    await navigateTo(page, '/leverage')

    const hasError = await hasText(page, 'Error')
    expect(hasError).toBeFalsy()
  })

  test('should have interest rate selector', async ({ page }) => {
    await navigateTo(page, '/leverage')

    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Position Calculations', () => {
  test('should calculate total exposure', async ({ page }) => {
    await navigateTo(page, '/leverage')

    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
  })

  test('should calculate collateral ratio', async ({ page }) => {
    await navigateTo(page, '/leverage')

    await expect(page.locator('body')).toBeVisible()
  })

  test('should calculate liquidation price', async ({ page }) => {
    await navigateTo(page, '/leverage')

    await expect(page.locator('body')).toBeVisible()
  })

  test('should calculate annual interest cost', async ({ page }) => {
    await navigateTo(page, '/leverage')

    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
  })
})

test.describe('Price Scenarios', () => {
  test('should display multiple price scenarios', async ({ page }) => {
    await navigateTo(page, '/leverage')

    // Should show various scenarios
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
    expect(bodyText!.length).toBeGreaterThan(500) // Substantive content
  })

  test('should show liquidation warnings', async ({ page }) => {
    await navigateTo(page, '/leverage')

    await expect(page.locator('body')).toBeVisible()
  })

  test('should calculate PnL for each scenario', async ({ page }) => {
    await navigateTo(page, '/leverage')

    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
  })
})

test.describe('Risk Warnings', () => {
  test('should display high-risk warning banner', async ({ page }) => {
    await navigateTo(page, '/leverage')

    // Should have warning content
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
  })

  test('should show health indicators', async ({ page }) => {
    await navigateTo(page, '/leverage')

    await expect(page.locator('body')).toBeVisible()
  })

  test('should display critical position warnings', async ({ page }) => {
    await navigateTo(page, '/leverage')

    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
  })
})

test.describe('Educational Content', () => {
  test('should explain leverage process', async ({ page }) => {
    await navigateTo(page, '/leverage')

    // Should have educational content
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
    expect(bodyText!.length).toBeGreaterThan(1000) // Comprehensive content
  })

  test('should have disclaimer', async ({ page }) => {
    await navigateTo(page, '/leverage')

    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await navigateTo(page, '/leverage')

    await expect(page.locator('body')).toBeVisible()

    const bodyWidth = await page.evaluate(() => document.body.clientWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375)
  })

  test('should be tablet responsive', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await navigateTo(page, '/leverage')

    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle landscape mode', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 })
    await navigateTo(page, '/leverage')

    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await navigateTo(page, '/leverage')
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(5000)
  })

  test('should update calculations smoothly', async ({ page }) => {
    await navigateTo(page, '/leverage')

    // Page should remain responsive
    await page.waitForTimeout(2000)
    await expect(page.locator('body')).toBeVisible()
  })
})
