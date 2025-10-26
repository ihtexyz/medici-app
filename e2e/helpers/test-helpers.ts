/**
 * Test Helper Utilities
 *
 * Common helper functions for E2E tests
 */

import { Page, expect } from '@playwright/test'

/**
 * Navigate to a page and wait for it to load
 */
export async function navigateTo(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
}

/**
 * Check if an element is visible
 */
export async function isVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector)
    await element.waitFor({ state: 'visible', timeout: 5000 })
    return true
  } catch {
    return false
  }
}

/**
 * Fill an input field
 */
export async function fillInput(page: Page, selector: string, value: string) {
  await page.locator(selector).fill(value)
  await page.waitForTimeout(500) // Allow for any input debouncing
}

/**
 * Click a button and wait
 */
export async function clickButton(page: Page, text: string) {
  await page.getByRole('button', { name: text }).click()
  await page.waitForTimeout(1000)
}

/**
 * Wait for text to appear on page
 */
export async function waitForText(page: Page, text: string, timeout: number = 10000) {
  await page.waitForSelector(`text=${text}`, { timeout })
}

/**
 * Check if page contains text
 */
export async function hasText(page: Page, text: string): Promise<boolean> {
  const content = await page.textContent('body')
  return content?.includes(text) ?? false
}

/**
 * Get text content from selector
 */
export async function getText(page: Page, selector: string): Promise<string> {
  const element = page.locator(selector)
  return (await element.textContent()) ?? ''
}

/**
 * Wait for a specific URL
 */
export async function waitForURL(page: Page, urlPattern: string | RegExp) {
  await page.waitForURL(urlPattern, { timeout: 10000 })
}

/**
 * Take a screenshot with a descriptive name
 */
export async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true })
}

/**
 * Mock console logs for debugging
 */
export async function captureConsoleLogs(page: Page) {
  const logs: string[] = []
  page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`))
  return logs
}

/**
 * Check if element has specific class
 */
export async function hasClass(page: Page, selector: string, className: string): Promise<boolean> {
  const element = page.locator(selector)
  const classes = await element.getAttribute('class')
  return classes?.includes(className) ?? false
}

/**
 * Get CSS property value
 */
export async function getCSS(page: Page, selector: string, property: string): Promise<string> {
  const element = page.locator(selector)
  const value = await element.evaluate((el, prop) => {
    return window.getComputedStyle(el).getPropertyValue(prop)
  }, property)
  return value
}

/**
 * Check if input is disabled
 */
export async function isDisabled(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector)
  return await element.isDisabled()
}

/**
 * Measure page performance
 */
export async function measurePerformance(page: Page) {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      loadComplete: navigation.loadEventEnd - navigation.fetchStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
    }
  })
  return metrics
}
