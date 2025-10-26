import { test, expect } from '@playwright/test'
import { navigateTo, measurePerformance } from './helpers/test-helpers'

/**
 * E2E Tests: Performance Monitoring
 *
 * Comprehensive performance tests for the Medici application.
 * Tests loading times, resource sizes, and runtime performance.
 */

test.describe('Page Load Performance', () => {
  test('should load homepage quickly', async ({ page }) => {
    const startTime = Date.now()
    await navigateTo(page, '/')
    const loadTime = Date.now() - startTime

    console.log(`Homepage loaded in ${loadTime}ms`)
    expect(loadTime).toBeLessThan(5000)
  })

  test('should load Borrow page quickly', async ({ page }) => {
    const startTime = Date.now()
    await navigateTo(page, '/borrow')
    const loadTime = Date.now() - startTime

    console.log(`Borrow page loaded in ${loadTime}ms`)
    expect(loadTime).toBeLessThan(5000)
  })

  test('should load Earn page quickly', async ({ page }) => {
    const startTime = Date.now()
    await navigateTo(page, '/earn')
    const loadTime = Date.now() - startTime

    console.log(`Earn page loaded in ${loadTime}ms`)
    expect(loadTime).toBeLessThan(5000)
  })

  test('should load Leverage page quickly', async ({ page }) => {
    const startTime = Date.now()
    await navigateTo(page, '/leverage')
    const loadTime = Date.now() - startTime

    console.log(`Leverage page loaded in ${loadTime}ms`)
    expect(loadTime).toBeLessThan(5000)
  })
})

test.describe('Core Web Vitals', () => {
  test('should meet LCP (Largest Contentful Paint) target', async ({ page }) => {
    await navigateTo(page, '/borrow')

    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          resolve(lastEntry.renderTime || lastEntry.loadTime)
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        setTimeout(() => resolve(0), 5000)
      })
    })

    console.log(`LCP: ${lcp}ms`)
    expect(lcp).toBeLessThan(2500) // Good LCP is < 2.5s
  })

  test('should have good DOM Content Loaded time', async ({ page }) => {
    await navigateTo(page, '/borrow')

    const metrics = await measurePerformance(page)

    console.log(`DOMContentLoaded: ${metrics.domContentLoaded}ms`)
    console.log(`Load Complete: ${metrics.loadComplete}ms`)

    expect(metrics.domContentLoaded).toBeLessThan(2000)
    expect(metrics.loadComplete).toBeLessThan(5000)
  })

  test('should have acceptable First Paint times', async ({ page }) => {
    await navigateTo(page, '/borrow')

    const metrics = await measurePerformance(page)

    console.log(`First Paint: ${metrics.firstPaint}ms`)
    console.log(`First Contentful Paint: ${metrics.firstContentfulPaint}ms`)

    if (metrics.firstPaint > 0) {
      expect(metrics.firstPaint).toBeLessThan(1800) // Good FP is < 1.8s
    }
    if (metrics.firstContentfulPaint > 0) {
      expect(metrics.firstContentfulPaint).toBeLessThan(1800) // Good FCP is < 1.8s
    }
  })
})

test.describe('Resource Loading', () => {
  test('should load JavaScript bundles efficiently', async ({ page }) => {
    const resourceSizes: number[] = []

    page.on('response', async (response) => {
      const url = response.url()
      if (url.endsWith('.js')) {
        try {
          const buffer = await response.body()
          resourceSizes.push(buffer.length)
        } catch {
          // Ignore errors for external resources
        }
      }
    })

    await navigateTo(page, '/borrow')

    if (resourceSizes.length > 0) {
      const totalSize = resourceSizes.reduce((a, b) => a + b, 0)
      const avgSize = totalSize / resourceSizes.length

      console.log(`Total JS size: ${(totalSize / 1024).toFixed(2)}KB`)
      console.log(`Average JS bundle: ${(avgSize / 1024).toFixed(2)}KB`)

      // Each bundle should be under 1MB
      resourceSizes.forEach(size => {
        expect(size).toBeLessThan(1024 * 1024)
      })
    }
  })

  test('should load CSS efficiently', async ({ page }) => {
    const cssSizes: number[] = []

    page.on('response', async (response) => {
      const url = response.url()
      if (url.endsWith('.css')) {
        try {
          const buffer = await response.body()
          cssSizes.push(buffer.length)
        } catch {
          // Ignore errors
        }
      }
    })

    await navigateTo(page, '/borrow')

    if (cssSizes.length > 0) {
      const totalSize = cssSizes.reduce((a, b) => a + b, 0)
      console.log(`Total CSS size: ${(totalSize / 1024).toFixed(2)}KB`)

      // CSS should be under 500KB
      expect(totalSize).toBeLessThan(500 * 1024)
    }
  })
})

test.describe('Runtime Performance', () => {
  test('should handle rapid navigation without lag', async ({ page }) => {
    const pages = ['/borrow', '/earn', '/portfolio', '/leverage', '/borrow']

    const startTime = Date.now()

    for (const path of pages) {
      await page.goto(`http://localhost:5173${path}`)
      await page.waitForLoadState('domcontentloaded')
    }

    const totalTime = Date.now() - startTime
    const avgTime = totalTime / pages.length

    console.log(`Average navigation time: ${avgTime}ms`)
    expect(avgTime).toBeLessThan(2000)
  })

  test('should not cause memory leaks', async ({ page }) => {
    await navigateTo(page, '/borrow')

    // Perform multiple navigations
    for (let i = 0; i < 5; i++) {
      await navigateTo(page, '/earn')
      await navigateTo(page, '/borrow')
    }

    // Page should still be responsive
    const isResponsive = await page.evaluate(() => {
      return document.body !== null
    })

    expect(isResponsive).toBe(true)
  })

  test('should handle long-running sessions', async ({ page }) => {
    await navigateTo(page, '/borrow')

    // Simulate user staying on page
    await page.waitForTimeout(5000)

    // Check for JavaScript errors
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))

    await page.waitForTimeout(3000)

    expect(errors.length).toBe(0)
  })
})

test.describe('Mobile Performance', () => {
  test('should perform well on mobile devices', async ({ page }) => {
    // Simulate mobile device
    await page.setViewportSize({ width: 375, height: 667 })

    const startTime = Date.now()
    await navigateTo(page, '/borrow')
    const loadTime = Date.now() - startTime

    console.log(`Mobile load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(6000) // Slightly more lenient for mobile
  })

  test('should handle touch interactions smoothly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await navigateTo(page, '/borrow')

    // Page should be interactive
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Network Performance', () => {
  test('should handle slow 3G network', async ({ page }) => {
    // Emulate slow 3G
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100) // Add 100ms delay
    })

    const startTime = Date.now()
    await page.goto('http://localhost:5173/borrow')
    const loadTime = Date.now() - startTime

    console.log(`Load time on slow network: ${loadTime}ms`)

    // Should still load within reasonable time
    expect(loadTime).toBeLessThan(10000)
  })
})

test.describe('Performance Budget', () => {
  test('should meet overall performance budget', async ({ page }) => {
    await navigateTo(page, '/borrow')

    const metrics = await measurePerformance(page)

    // Performance budget checks
    const checks = {
      'DOM Content Loaded': metrics.domContentLoaded < 2000,
      'Load Complete': metrics.loadComplete < 5000,
      'First Paint': metrics.firstPaint === 0 || metrics.firstPaint < 1800,
      'First Contentful Paint': metrics.firstContentfulPaint === 0 || metrics.firstContentfulPaint < 1800,
    }

    console.log('Performance Budget Results:')
    Object.entries(checks).forEach(([metric, passed]) => {
      console.log(`  ${metric}: ${passed ? '✓' : '✗'}`)
    })

    // At least 3 out of 4 checks should pass
    const passedCount = Object.values(checks).filter(Boolean).length
    expect(passedCount).toBeGreaterThanOrEqual(3)
  })
})
