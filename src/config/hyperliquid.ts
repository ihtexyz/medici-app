/**
 * HyperEVM (Hyperliquid) Configuration
 *
 * HyperEVM is Hyperliquid's EVM-compatible execution layer
 * Fully compatible with standard EVM tooling (Hardhat, Foundry, Web3 libraries)
 *
 * Key Features:
 * - Direct integration with HyperCore (spot/perp order books)
 * - Secured by HyperBFT consensus
 * - Native token: HYPE
 * - Chain ID: 999
 *
 * Resources:
 * - Docs: https://hyperliquid.gitbook.io/hyperliquid-docs/hyperevm
 * - Explorer: https://hyperevmscan.io
 * - Felix Protocol: https://usefelix.xyz (Liquity V2 fork on HyperEVM)
 */

export const HYPEREVM_CHAIN_ID = 999

/**
 * HyperEVM Token Addresses
 * Note: Addresses will be updated once CENT protocol is deployed to HyperEVM
 */
export const HYPEREVM_TOKENS = {
  // Native token
  HYPE: 'native',

  // Wrapped tokens (to be added after ecosystem growth)
  WHYPE: '0x...', // Wrapped HYPE (if exists)

  // Bridged assets
  UBTC: '0x...', // Bridged Bitcoin
  WETH: '0x...', // Bridged Ethereum
  USDC: '0x...', // Bridged USDC

  // Future: Liquid staked tokens
  wstHYPE: '0x...', // Wrapped staked HYPE
  rHYPE: '0x...', // Rocket Pool style HYPE

  // Future: Hyperliquid ecosystem tokens
  hwHLP: '0x...', // Hyperwave HLP
  WHLP: '0x...', // Wrapped HLP
} as const

/**
 * HyperEVM Network Configuration
 */
export const HYPEREVM_CONFIG = {
  chainId: HYPEREVM_CHAIN_ID,
  name: 'Hyperliquid',
  shortName: 'hyper',

  // RPC Configuration
  rpcUrl: 'https://rpc.hyperliquid.xyz/evm',
  rpcRateLimit: 100, // requests per minute for public RPC

  // Block Explorer
  blockExplorer: 'https://hyperevmscan.io',
  blockExplorerName: 'HyperScan',

  // Alternative explorers
  altExplorers: [
    'https://purrsec.com',
    'https://www.hyperscan.com',
  ],

  // Native currency
  currency: {
    name: 'HYPE',
    symbol: 'HYPE',
    decimals: 18,
  },

  // Network type
  testnet: false,
  mainnet: true,

  // Gas configuration
  gas: {
    token: 'HYPE',
    estimatedGasPerTransaction: '0.001', // Estimated HYPE per transaction
    baseFeeSupported: true, // Uses Ethereum-style base fee + priority fee
  },

  // Bridge information
  bridge: {
    hyperCoreToHyperEVM: '0x2222222222222222222222222222222222222222',
    wormhole: true, // Wormhole bridge support
    wormholeChainId: 999,
  },

  // Unique features
  features: {
    hyperCoreIntegration: true, // Direct access to HyperCore
    orderBookAccess: true, // Can read spot/perp order books
    writeContracts: false, // Write contracts not yet live (coming soon)
    precompiles: true, // Custom precompiles for price data
  },
} as const

/**
 * Get HYPE token address for a specific chain
 * Returns 'native' for HyperEVM, wrapped address for other chains
 */
export function getHYPEAddress(chainId: number): string | null {
  if (chainId === HYPEREVM_CHAIN_ID) {
    return 'native'
  }
  // TODO: Add wrapped HYPE addresses for Base, Ethereum when available
  return null
}

/**
 * Get token address on HyperEVM
 */
export function getHyperEVMTokenAddress(
  tokenSymbol: keyof typeof HYPEREVM_TOKENS
): string | null {
  const address = HYPEREVM_TOKENS[tokenSymbol]
  if (!address || address === '0x...') return null
  return address === 'native' ? null : address
}

/**
 * Check if a token is supported on HyperEVM
 */
export function isTokenSupportedOnHyperEVM(tokenSymbol: string): boolean {
  const symbol = tokenSymbol.toUpperCase() as keyof typeof HYPEREVM_TOKENS
  const address = HYPEREVM_TOKENS[symbol]
  return address !== undefined && address !== '0x...'
}

/**
 * Get block explorer URL for an address
 */
export function getHyperEVMExplorerUrl(address: string): string {
  return `${HYPEREVM_CONFIG.blockExplorer}/address/${address}`
}

/**
 * Get block explorer URL for a transaction
 */
export function getHyperEVMTxUrl(txHash: string): string {
  return `${HYPEREVM_CONFIG.blockExplorer}/tx/${txHash}`
}

/**
 * Format HYPE amount with proper decimals
 */
export function formatHYPEAmount(amount: bigint | string): string {
  const value = typeof amount === 'string' ? BigInt(amount) : amount
  const decimals = HYPEREVM_CONFIG.currency.decimals
  const divisor = BigInt(10 ** decimals)
  const quotient = value / divisor
  const remainder = value % divisor
  const formatted = `${quotient}.${remainder.toString().padStart(decimals, '0')}`
  return parseFloat(formatted).toFixed(4)
}

/**
 * Parse HYPE amount from decimal string to wei
 */
export function parseHYPEAmount(amount: string): bigint {
  const decimals = HYPEREVM_CONFIG.currency.decimals
  const [whole = '0', fraction = '0'] = amount.split('.')
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole) * BigInt(10 ** decimals) + BigInt(paddedFraction)
}

/**
 * Check if user is on HyperEVM network
 */
export function isHyperEVM(chainId: number | undefined): boolean {
  return chainId === HYPEREVM_CHAIN_ID
}

/**
 * Get recommended RPC providers for production
 */
export const RECOMMENDED_RPC_PROVIDERS = [
  {
    name: 'QuickNode',
    url: 'https://www.quicknode.com/docs/hyperliquid',
    features: ['High rate limits', 'WebSocket support', 'Analytics'],
  },
  {
    name: 'Chainstack',
    url: 'https://chainstack.com/hyperliquid-rpc-node/',
    features: ['Dedicated nodes', 'High availability', 'Custom rate limits'],
  },
  {
    name: '1RPC',
    url: 'https://www.1rpc.io/ecosystem/hyperevm',
    features: ['Privacy-focused', 'No tracking', 'Free tier available'],
  },
] as const

/**
 * Felix Protocol (reference implementation on HyperEVM)
 * Liquity V2 fork - same architecture as CENT protocol
 */
export const FELIX_PROTOCOL = {
  name: 'Felix Protocol',
  website: 'https://usefelix.xyz',
  docs: 'https://usefelix.gitbook.io/felix-docs',
  github: 'https://github.com/felixprotocol/felix-contracts',
  stablecoin: 'feUSD',
  tvl: '$100M+', // As of deployment
  status: 'live',
  architecture: 'Liquity V2',
  features: [
    'Multi-collateral branches (HYPE, UBTC, LSTs)',
    'User-set interest rates',
    'NFT-based troves',
    'Stability pool',
    'Redemptions',
  ],
  relevance: 'Proves CENT can deploy to HyperEVM with same architecture',
} as const

export default HYPEREVM_CONFIG
