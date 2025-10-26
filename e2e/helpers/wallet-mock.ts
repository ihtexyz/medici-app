/**
 * Wallet Mock Utilities
 *
 * Helper functions for mocking wallet connections in E2E tests.
 * Since we can't actually connect MetaMask in automated tests,
 * we'll mock the wallet connection state.
 */

import { Page } from '@playwright/test'

/**
 * Mock wallet connection by setting localStorage
 * This simulates a connected wallet state
 */
export async function mockWalletConnection(page: Page, address: string = '0x1234567890123456789012345678901234567890') {
  await page.evaluate((addr) => {
    // Mock wallet connection in localStorage
    localStorage.setItem('wagmi.connected', 'true')
    localStorage.setItem('wagmi.store', JSON.stringify({
      state: {
        connections: {
          __type: 'Map',
          value: [[
            'mock',
            {
              accounts: [addr],
              chainId: 84532, // Base Sepolia
              connector: { id: 'mock', name: 'Mock Wallet', type: 'injected' }
            }
          ]]
        },
        current: 'mock',
        status: 'connected'
      },
      version: 2
    }))
  }, address)
}

/**
 * Mock wallet disconnection
 */
export async function mockWalletDisconnect(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('wagmi.connected')
    localStorage.removeItem('wagmi.store')
  })
}

/**
 * Check if wallet appears connected in UI
 */
export async function isWalletConnected(page: Page): Promise<boolean> {
  // Look for common connected wallet indicators
  const connected = await page.evaluate(() => {
    const store = localStorage.getItem('wagmi.store')
    if (!store) return false
    const parsed = JSON.parse(store)
    return parsed?.state?.status === 'connected'
  })
  return connected
}

/**
 * Wait for wallet connection UI to update
 */
export async function waitForWalletState(page: Page, timeout: number = 5000) {
  await page.waitForTimeout(timeout)
}
