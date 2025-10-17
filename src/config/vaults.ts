/**
 * Genesis Vaults Configuration
 * 
 * This file contains vault addresses and configuration for the Medici Invest page.
 * Update these addresses after deploying vaults to testnet/mainnet.
 */

export interface VaultConfig {
  address: string
  name: string
  symbol: string
  assetType: 'BTC' | 'USDC' | 'USDT'
  asset: string
  assetSymbol: string
  assetDecimals: number
  maxDeposit: string // in asset units
  feePercent: number
  description: string
  logo: string
}

// Arbitrum Sepolia Testnet
const ARBITRUM_SEPOLIA_CHAIN_ID = 421614

// Token addresses on Arbitrum Sepolia
const TOKENS_ARBITRUM_SEPOLIA = {
  WBTC: '0x0000000000000000000000000000000000000000', // TODO: Update after deployment
  USDC: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  USDT: '0x0000000000000000000000000000000000000000', // TODO: Update after deployment
}

// Vault addresses on Arbitrum Sepolia (from deployments/arbitrum-sepolia-vaults.json)
const VAULTS_ARBITRUM_SEPOLIA = {
  BTC: '0x0000000000000000000000000000000000000000', // TODO: Update after deployment
  USDC: '0x0000000000000000000000000000000000000000', // TODO: Update after deployment
  USDT: '0x0000000000000000000000000000000000000000', // TODO: Update after deployment
}

export const GENESIS_VAULTS: Record<number, VaultConfig[]> = {
  // Arbitrum Sepolia Testnet
  [ARBITRUM_SEPOLIA_CHAIN_ID]: [
    {
      address: VAULTS_ARBITRUM_SEPOLIA.BTC,
      name: 'Venice BTC Genesis Vault',
      symbol: 'vBTC',
      assetType: 'BTC',
      asset: TOKENS_ARBITRUM_SEPOLIA.WBTC,
      assetSymbol: 'WBTC',
      assetDecimals: 8,
      maxDeposit: '10', // 10 BTC
      feePercent: 0.25,
      description: 'Earn yield by lending WBTC. Your deposit is secured and earns interest from borrowers.',
      logo: '₿',
    },
    {
      address: VAULTS_ARBITRUM_SEPOLIA.USDC,
      name: 'Venice USDC Genesis Vault',
      symbol: 'vUSDC',
      assetType: 'USDC',
      asset: TOKENS_ARBITRUM_SEPOLIA.USDC,
      assetSymbol: 'USDC',
      assetDecimals: 6,
      maxDeposit: '1000000', // 1M USDC
      feePercent: 0.25,
      description: 'Earn yield by lending USDC. Stablecoin lending with consistent returns.',
      logo: '$',
    },
    {
      address: VAULTS_ARBITRUM_SEPOLIA.USDT,
      name: 'Venice USDT Genesis Vault',
      symbol: 'vUSDT',
      assetType: 'USDT',
      asset: TOKENS_ARBITRUM_SEPOLIA.USDT,
      assetSymbol: 'USDT',
      assetDecimals: 6,
      maxDeposit: '1000000', // 1M USDT
      feePercent: 0.25,
      description: 'Earn yield by lending USDT. Stablecoin lending with consistent returns.',
      logo: '₮',
    },
  ],
  
  // Add mainnet configuration after deployment
  // [42161]: [ ... ]
}

/**
 * Get vaults for the current chain
 */
export function getVaultsForChain(chainId: number | undefined): VaultConfig[] {
  if (!chainId) return []
  return GENESIS_VAULTS[chainId] || []
}

/**
 * Get a specific vault by address
 */
export function getVaultByAddress(chainId: number | undefined, address: string): VaultConfig | undefined {
  const vaults = getVaultsForChain(chainId)
  return vaults.find(v => v.address.toLowerCase() === address.toLowerCase())
}

/**
 * Check if vaults are deployed on current chain
 */
export function hasVaultsDeployed(chainId: number | undefined): boolean {
  const vaults = getVaultsForChain(chainId)
  return vaults.length > 0 && vaults[0].address !== '0x0000000000000000000000000000000000000000'
}

