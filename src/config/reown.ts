/**
 * Reown AppKit Configuration
 * Single authentication provider for the entire app
 * Supports: Wallet connections, Email & Social login, Multi-chain
 */

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { arbitrumSepolia, sepolia, baseSepolia } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getEnvOptional } from '../lib/runtime-env'

// HyperEVM custom network definition
// Hyperliquid's EVM-compatible execution layer
const hyperEVM: AppKitNetwork = {
  id: 999,
  name: 'Hyperliquid',
  nativeCurrency: {
    name: 'HYPE',
    symbol: 'HYPE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
    public: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HyperScan',
      url: 'https://hyperevmscan.io',
    },
  },
  testnet: false,
}

// Get project ID from environment
// Default to production project ID if not set
const projectId = getEnvOptional('VITE_REOWN_PROJECT_ID') || 'b6c8592d7c27bead6b6036478b0a7a42'

// Log which project ID is being used (safe for tests)
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.log('🔐 Reown AppKit initialized with project:', projectId)
}

// Query client for react-query
const queryClient = new QueryClient()

// Wagmi configuration
// Base Sepolia is now the primary chain, with HyperEVM support
const wagmiAdapter = new WagmiAdapter({
  networks: [baseSepolia, hyperEVM, arbitrumSepolia, sepolia],
  projectId,
  ssr: false,
})

// Get app URL - use env var or window location
const getAppUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return getEnvOptional('VITE_APP_URL') || 'https://origamibtc.netlify.app'
}

// Create AppKit instance
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [baseSepolia, hyperEVM, arbitrumSepolia, sepolia],
  projectId,
  metadata: {
    name: 'Medici by Venice Fi',
    description: 'Professional Bitcoin wealth management - Borrow, earn, and swap powered by Venice Fi',
    url: getAppUrl(),
    icons: [`${getAppUrl()}/favicon.ico`]
  },
  features: {
    analytics: true,
    email: true, // Enable email login
    socials: ['google', 'github', 'apple'], // Social logins
    emailShowWallets: true,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#FF9500', // Orange
    '--w3m-border-radius-master': '12px',
  }
})

// Export wagmi config
export const wagmiConfig = wagmiAdapter.wagmiConfig

// Export providers
export { WagmiProvider, QueryClientProvider, queryClient }

