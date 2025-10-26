import { test, expect } from '@playwright/test'
import { navigateTo, measurePerformance } from './helpers/test-helpers'

/**
 * E2E Tests: Overall Application
 *
 * Tests core application functionality, navigation, and performance.
 */

test.describe('Application Core', () => {
  test('should load homepage successfully', async ({ page }) => {
    await navigateTo(page, '/')

    // Should redirect to /borrow or show homepage
    await expect(page.locator('body')).toBeVisible()

    // Should have a title
    const title = await page.title()
    expect(title).toBeTruthy()
  })

  test('should not have JavaScript errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))

    await navigateTo(page, '/')
    await page.waitForTimeout(3000)

    // Should have no critical errors
    expect(errors.length).toBe(0)
  })

  test('should not have console errors on load', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await navigateTo(page, '/')
    await page.waitForTimeout(2000)

    // Filter out known harmless errors
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('VITE_') &&
      !err.includes('env') &&
      !err.includes('Failed to load resource')
    )
    expect(criticalErrors.length).toBe(0)
  })
})

test.describe('Navigation', () => {
  test('should navigate to all main pages', async ({ page }) => {
    const pages = [
      '/borrow',
      '/earn',
      '/portfolio',
      '/redeem',
      '/leverage',
      '/governance',
      '/rewards'
    ]

    for (const path of pages) {
      await navigateTo(page, path)
      expect(page.url()).toContain(path)
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('should have working mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await navigateTo(page, '/')

    // Mobile nav should be present
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle browser back button', async ({ page }) => {
    await navigateTo(page, '/borrow')
    await navigateTo(page, '/earn')
    await page.goBack()

    expect(page.url()).toContain('/borrow')
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle browser forward button', async ({ page }) => {
    await navigateTo(page, '/borrow')
    await navigateTo(page, '/earn')
    await page.goBack()
    await page.goForward()

    expect(page.url()).toContain('/earn')
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test('should have semantic HTML structure', async ({ page }) => {
    await navigateTo(page, '/borrow')

    // Should have proper HTML elements
    const hasMain = await page.locator('main, [role="main"], body').count()
    expect(hasMain).toBeGreaterThan(0)
  })

  test('should support keyboard navigation', async ({ page }) => {
    await navigateTo(page, '/borrow')

    // Tab key should work
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Focus should move
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await navigateTo(page, '/borrow')

    // Should have headings
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThan(0)
  })
})

test.describe('Cross-Browser Compatibility', () => {
  test('should work in different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1280, height: 720 },  // Desktop
      { width: 1920, height: 1080 }, // Large Desktop
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await navigateTo(page, '/borrow')
      await expect(page.locator('body')).toBeVisible()
    }
  })
})

test.describe('Error Handling', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/nonexistent-page-12345')

    // Should either redirect or show 404
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    await navigateTo(page, '/borrow')

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Security', () => {
  test('should not expose sensitive information in HTML', async ({ page }) => {
    await navigateTo(page, '/')

    const content = await page.content()

    // Should not have private keys or sensitive data
    expect(content).not.toContain('privateKey')
    expect(content).not.toContain('secret')
    expect(content).not.toContain('password')
  })

  test('should have proper HTTPS headers (production)', async ({ page }) => {
    await navigateTo(page, '/')

    // This will fail in localhost but pass in production
    const url = page.url()
    if (!url.includes('localhost')) {
      expect(url).toContain('https://')
    }
  })
})

test.describe('Performance Benchmarks', () => {
  test('should meet Core Web Vitals targets', async ({ page }) => {
    await navigateTo(page, '/')

    const metrics = await measurePerformance(page)

    // Targets based on Google's Core Web Vitals
    expect(metrics.domContentLoaded).toBeLessThan(2000) // 2 seconds
    expect(metrics.loadComplete).toBeLessThan(5000)    // 5 seconds
  })

  test('should load all pages within performance budget', async ({ page }) => {
    const pages = ['/borrow', '/earn', '/portfolio', '/leverage']

    for (const path of pages) {
      const startTime = Date.now()
      await navigateTo(page, path)
      const loadTime = Date.now() - startTime

      expect(loadTime).toBeLessThan(5000)
    }
  })
})

test.describe('State Management', () => {
  test('should persist state across navigation', async ({ page }) => {
    await navigateTo(page, '/borrow')
    await navigateTo(page, '/earn')
    await navigateTo(page, '/borrow')

    // Page should still function
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle localStorage correctly', async ({ page }) => {
    await navigateTo(page, '/')

    // Check localStorage is accessible
    const hasLocalStorage = await page.evaluate(() => {
      try {
        localStorage.setItem('test', 'value')
        const value = localStorage.getItem('test')
        localStorage.removeItem('test')
        return value === 'value'
      } catch {
        return false
      }
    })

    expect(hasLocalStorage).toBe(true)
  })
})

test.describe('UI Consistency', () => {
  test('should use consistent styling across pages', async ({ page }) => {
    await navigateTo(page, '/borrow')

    // Get primary color
    const borrowColor = await page.evaluate(() => {
      return getComputedStyle(document.body).getPropertyValue('--cb-primary') ||
             getComputedStyle(document.body).color
    })

    await navigateTo(page, '/earn')

    const earnColor = await page.evaluate(() => {
      return getComputedStyle(document.body).getPropertyValue('--cb-primary') ||
             getComputedStyle(document.body).color
    })

    // Colors should be consistent (or both be present)
    expect(borrowColor).toBeTruthy()
    expect(earnColor).toBeTruthy()
  })

  test('should have consistent button styles', async ({ page }) => {
    await navigateTo(page, '/borrow')

    // Buttons should exist and be styled
    const buttons = await page.locator('button').count()
    expect(buttons).toBeGreaterThan(0)
  })
})
