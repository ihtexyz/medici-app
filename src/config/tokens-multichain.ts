/**
 * Multi-Chain Token Configuration
 * Token addresses for Base Sepolia, Arbitrum Sepolia, ETH Sepolia, and HyperEVM
 *
 * Note: Testnet token addresses vary by protocol. These are commonly used addresses.
 * HyperEVM addresses will be updated after CENT protocol deployment.
 */

export const CHAIN_IDS = {
  BASE_SEPOLIA: 84532,
  HYPEREVM: 999,
  ARBITRUM_SEPOLIA: 421614,
  ETH_SEPOLIA: 11155111,
} as const

/**
 * Token addresses by chain
 * Native tokens are represented as 'native'
 * - ETH on Base, Arbitrum, Ethereum Sepolia
 * - HYPE on HyperEVM
 */
export const TOKEN_ADDRESSES = {
  // Base Sepolia (84532)
  [CHAIN_IDS.BASE_SEPOLIA]: {
    ETH: 'native',
    WETH: '0x4200000000000000000000000000000000000006', // Canonical WETH
    USDC: '0x036cbd53842c5426634e7929541ec2318f3dcf7e', // Circle USDC
    WBTC: '0x4131600fd78eb697413ca806a8f748edb959ddcd', // Wrapped Bitcoin
  },

  // HyperEVM (999) - Hyperliquid's EVM-compatible layer
  [CHAIN_IDS.HYPEREVM]: {
    HYPE: 'native', // Native token on HyperEVM
    // TODO: Update these addresses after CENT protocol deployment
    WHYPE: '0x...', // Wrapped HYPE (if exists)
    UBTC: '0x...', // Bridged Bitcoin
    WETH: '0x...', // Bridged Ethereum
    USDC: '0x...', // Bridged USDC
    // Additional HyperEVM ecosystem tokens
    wstHYPE: '0x...', // Liquid staked HYPE
    hwHLP: '0x...', // Hyperwave HLP token
  },

  // Arbitrum Sepolia (421614)
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: {
    ETH: 'native',
    WETH: '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73', // Common WETH
    USDC: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Common USDC
    WBTC: '0x3ba8429a2a30685820f07fc40dff3d2b17488f85', // WBTC testnet
  },

  // Ethereum Sepolia (11155111)
  [CHAIN_IDS.ETH_SEPOLIA]: {
    ETH: 'native',
    WETH: '0x7b79995e5f793a07bc00c21412e50ecae098e7f9', // Common WETH
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Circle USDC
    WBTC: '0x29f2d40b0605204364af54EC677bD022dA425d03', // WBTC testnet
  },
} as const

/**
 * Token metadata (decimals, symbols, names)
 */
export const TOKEN_METADATA = {
  ETH: {
    symbol: 'ETH',
    name: 'Ether',
    decimals: 18,
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
  WBTC: {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
  },
  CENT: {
    symbol: 'CENT',
    name: 'Venice CENT',
    decimals: 6,
  },
  // HyperEVM tokens
  HYPE: {
    symbol: 'HYPE',
    name: 'Hyperliquid',
    decimals: 18,
  },
  WHYPE: {
    symbol: 'WHYPE',
    name: 'Wrapped HYPE',
    decimals: 18,
  },
  UBTC: {
    symbol: 'UBTC',
    name: 'Universal Bitcoin',
    decimals: 8,
  },
  wstHYPE: {
    symbol: 'wstHYPE',
    name: 'Wrapped Staked HYPE',
    decimals: 18,
  },
  hwHLP: {
    symbol: 'hwHLP',
    name: 'Hyperwave HLP',
    decimals: 18,
  },
} as const

export type TokenSymbol = keyof typeof TOKEN_METADATA
export type ChainId = typeof CHAIN_IDS[keyof typeof CHAIN_IDS]

/**
 * Get token address for a specific chain and token
 */
export function getTokenAddress(
  chainId: ChainId,
  token: TokenSymbol
): string | null {
  const chainTokens = TOKEN_ADDRESSES[chainId]
  if (!chainTokens) return null

  const address = chainTokens[token as keyof typeof chainTokens]
  return address === 'native' ? null : address
}

/**
 * Check if token is native (ETH or HYPE)
 */
export function isNativeToken(token: TokenSymbol): boolean {
  return token === 'ETH' || token === 'HYPE'
}

/**
 * Get token metadata
 */
export function getTokenMetadata(token: TokenSymbol) {
  return TOKEN_METADATA[token]
}

/**
 * Get all supported tokens for a chain
 */
export function getSupportedTokens(chainId: ChainId): TokenSymbol[] {
  const chainTokens = TOKEN_ADDRESSES[chainId]
  if (!chainTokens) return []

  return Object.keys(chainTokens) as TokenSymbol[]
}

/**
 * Check if a token is supported on a chain
 */
export function isTokenSupported(chainId: ChainId, token: TokenSymbol): boolean {
  const address = getTokenAddress(chainId, token)
  return address !== null || isNativeToken(token)
}

/**
 * Get WETH address for wrapping/unwrapping
 */
export function getWETHAddress(chainId: ChainId): string | null {
  return getTokenAddress(chainId, 'WETH')
}

/**
 * Format token amount with proper decimals
 */
export function formatTokenAmount(
  amount: bigint | number | string,
  token: TokenSymbol
): string {
  const metadata = getTokenMetadata(token)
  const numAmount = typeof amount === 'bigint' ? Number(amount) : Number(amount)
  const divisor = Math.pow(10, metadata.decimals)
  const formatted = numAmount / divisor

  // Format based on token type
  if (token === 'WBTC' || token === 'UBTC') {
    return formatted.toFixed(6) // 6 decimals for BTC variants
  } else if (token === 'USDC' || token === 'CENT') {
    return formatted.toFixed(2) // 2 decimals for USD stablecoins
  } else {
    return formatted.toFixed(4) // 4 decimals for ETH/WETH/HYPE/WHYPE
  }
}

/**
 * Parse token amount to smallest unit (wei for ETH, etc.)
 */
export function parseTokenAmount(
  amount: string,
  token: TokenSymbol
): bigint {
  const metadata = getTokenMetadata(token)
  const multiplier = BigInt(10 ** metadata.decimals)
  const [whole, decimal = ''] = amount.split('.')
  const paddedDecimal = decimal.padEnd(metadata.decimals, '0').slice(0, metadata.decimals)
  return BigInt(whole + paddedDecimal)
}
