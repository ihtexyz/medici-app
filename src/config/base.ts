/**
 * Base Sepolia Configuration
 * Token addresses and network configuration for Base Sepolia testnet
 * Source: https://docs.base.org/base-chain/quickstart/deploy-on-base
 */

export const BASE_SEPOLIA_CHAIN_ID = 84532

/**
 * Base Sepolia Token Addresses
 * Official contract addresses from Base documentation
 */
export const BASE_SEPOLIA_TOKENS = {
  // Native ETH is not a token contract (address 0x0)
  ETH: 'native',

  // Wrapped ETH - Canonical WETH contract on Base
  WETH: '0x4200000000000000000000000000000000000006',

  // USD Coin - Circle's USDC on Base Sepolia
  USDC: '0x036cbd53842c5426634e7929541ec2318f3dcf7e',

  // Wrapped Bitcoin - WBTC on Base Sepolia
  WBTC: '0x4131600fd78eb697413ca806a8f748edb959ddcd',
} as const

/**
 * Base Sepolia Network Configuration
 */
export const BASE_SEPOLIA_CONFIG = {
  chainId: BASE_SEPOLIA_CHAIN_ID,
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  currency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
} as const

/**
 * Token metadata for Base Sepolia
 */
export const BASE_SEPOLIA_TOKEN_INFO = {
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: BASE_SEPOLIA_TOKENS.WETH,
    decimals: 18,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: BASE_SEPOLIA_TOKENS.USDC,
    decimals: 6,
  },
  WBTC: {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: BASE_SEPOLIA_TOKENS.WBTC,
    decimals: 8,
  },
} as const

/**
 * Helper function to get Base Sepolia token address by symbol
 */
export function getBaseSepoliaTokenAddress(symbol: 'WETH' | 'USDC' | 'WBTC'): string {
  return BASE_SEPOLIA_TOKENS[symbol]
}

/**
 * Helper function to check if an address is a Base Sepolia token
 */
export function isBaseSepoliaToken(address: string): boolean {
  const lowerAddress = address.toLowerCase()
  return Object.values(BASE_SEPOLIA_TOKENS)
    .filter(addr => addr !== 'native')
    .map(addr => addr.toLowerCase())
    .includes(lowerAddress)
}

/**
 * Helper function to get token info by address
 */
export function getBaseSepoliaTokenInfo(address: string): typeof BASE_SEPOLIA_TOKEN_INFO[keyof typeof BASE_SEPOLIA_TOKEN_INFO] | undefined {
  const lowerAddress = address.toLowerCase()
  return Object.values(BASE_SEPOLIA_TOKEN_INFO).find(
    token => token.address.toLowerCase() === lowerAddress
  )
}
