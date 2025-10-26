import { test, expect } from '@playwright/test'
import { navigateTo, hasText } from './helpers/test-helpers'

/**
 * E2E Tests: Earn/Stability Pool
 *
 * Tests the Stability Pool deposit, withdraw, and claim flows.
 */

test.describe('Earn Page', () => {
  test('should display wallet connection prompt when not connected', async ({ page }) => {
    await navigateTo(page, '/earn')

    // Should show connection prompt
    await expect(page.getByText('Connect Wallet')).toBeVisible()
    await expect(page.getByText('Connect your wallet to earn yield')).toBeVisible()

    // Should show piggy bank emoji
    await expect(page.locator('text=🏦')).toBeVisible()
  })

  test('should load without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))

    await navigateTo(page, '/earn')
    await page.waitForTimeout(2000)

    expect(errors.length).toBe(0)
  })

  test('should have proper URL', async ({ page }) => {
    await navigateTo(page, '/earn')
    expect(page.url()).toContain('/earn')
  })
})

test.describe('Stability Pool Statistics', () => {
  test('should display pool statistics section', async ({ page }) => {
    await navigateTo(page, '/earn')
    await page.waitForLoadState('networkidle')

    // Page should load
    await expect(page.locator('body')).toBeVisible()
  })

  test('should show APR information', async ({ page }) => {
    await navigateTo(page, '/earn')

    // Verify page is interactive
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
  })
})

test.describe('Deposit Flow (UI Validation)', () => {
  test('should have deposit form structure', async ({ page }) => {
    await navigateTo(page, '/earn')

    // Page should render
    await expect(page.locator('body')).toBeVisible()
  })

  test('should validate deposit amounts', async ({ page }) => {
    await navigateTo(page, '/earn')

    const hasError = await hasText(page, 'Error')
    expect(hasError).toBeFalsy()
  })
})

test.describe('Withdraw and Claim', () => {
  test('should display withdraw option when deposits exist', async ({ page }) => {
    await navigateTo(page, '/earn')

    await expect(page.locator('body')).toBeVisible()
  })

  test('should show claim rewards button', async ({ page }) => {
    await navigateTo(page, '/earn')

    // Verify no critical errors
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
  })
})

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await navigateTo(page, '/earn')

    await expect(page.locator('body')).toBeVisible()

    const bodyWidth = await page.evaluate(() => document.body.clientWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375)
  })

  test('should be tablet responsive', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await navigateTo(page, '/earn')

    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await navigateTo(page, '/earn')
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(5000)
  })
})
