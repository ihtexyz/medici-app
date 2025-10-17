/**
 * Vault Data Service
 * Fetches real-time vault data: TVL, APY, user balances, shares
 */

import { ethers, type Provider } from 'ethers'
import { formatCompactNumber } from './marketData'

// ERC4626 ABI subset
const VAULT_ABI = [
  'function totalAssets() view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function asset() view returns (address)',
  'function convertToAssets(uint256 shares) view returns (uint256)',
  'function decimals() view returns (uint8)',
]

const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]

export interface VaultData {
  address: string
  tvl: string
  tvlFormatted: string
  apy: string
  totalAssets: string
  totalShares: string
  userBalance: string
  userShares: string
  userSharesValue: string
  assetSymbol: string
  assetDecimals: number
}

/**
 * Fetch vault data from contract
 */
export async function fetchVaultData(
  provider: Provider,
  vaultAddress: string,
  userAddress?: string
): Promise<VaultData> {
  try {
    const vaultContract = new ethers.Contract(vaultAddress, VAULT_ABI, provider)

    // Fetch basic vault info
    const [totalAssets, totalSupply, vaultDecimals, assetAddress] = await Promise.all([
      vaultContract.totalAssets(),
      vaultContract.totalSupply(),
      vaultContract.decimals(),
      vaultContract.asset(),
    ])

    // Fetch asset info
    const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, provider)
    const [assetSymbol, assetDecimals, userAssetBalance, userVaultShares] = await Promise.all([
      assetContract.symbol(),
      assetContract.decimals(),
      userAddress ? assetContract.balanceOf(userAddress) : 0n,
      userAddress ? vaultContract.balanceOf(userAddress) : 0n,
    ])

    // Calculate user's shares value in assets
    let userSharesValue = 0n
    if (userAddress && userVaultShares > 0n) {
      userSharesValue = await vaultContract.convertToAssets(userVaultShares)
    }

    // Format values
    const totalAssetsFormatted = ethers.formatUnits(totalAssets, assetDecimals)
    const totalSupplyFormatted = ethers.formatUnits(totalSupply, vaultDecimals)
    const userBalanceFormatted = ethers.formatUnits(userAssetBalance, assetDecimals)
    const userSharesFormatted = ethers.formatUnits(userVaultShares, vaultDecimals)
    const userSharesValueFormatted = ethers.formatUnits(userSharesValue, assetDecimals)

    // Calculate APY (mock for now - would need historical data)
    const mockAPY = '8.50'

    // Calculate TVL in USD (mock prices for now)
    const mockPrices: Record<string, number> = {
      WBTC: 67500,
      USDC: 1.0,
      USDT: 1.0,
    }
    const price = mockPrices[assetSymbol] || 1.0
    const tvlUsd = parseFloat(totalAssetsFormatted) * price

    return {
      address: vaultAddress,
      tvl: tvlUsd.toFixed(2),
      tvlFormatted: formatCompactNumber(tvlUsd),
      apy: mockAPY,
      totalAssets: totalAssetsFormatted,
      totalShares: totalSupplyFormatted,
      userBalance: userBalanceFormatted,
      userShares: userSharesFormatted,
      userSharesValue: userSharesValueFormatted,
      assetSymbol,
      assetDecimals: Number(assetDecimals),
    }
  } catch (error) {
    console.error('Error fetching vault data:', error)
    // Return mock data
    return {
      address: vaultAddress,
      tvl: '0',
      tvlFormatted: '$0',
      apy: '0.00',
      totalAssets: '0',
      totalShares: '0',
      userBalance: '0',
      userShares: '0',
      userSharesValue: '0',
      assetSymbol: 'UNKNOWN',
      assetDecimals: 18,
    }
  }
}

/**
 * Fetch data for multiple vaults in parallel
 */
export async function fetchMultipleVaults(
  provider: Provider,
  vaultAddresses: string[],
  userAddress?: string
): Promise<Record<string, VaultData>> {
  const results = await Promise.all(
    vaultAddresses.map((address) => fetchVaultData(provider, address, userAddress))
  )

  return Object.fromEntries(results.map((data) => [data.address, data]))
}


