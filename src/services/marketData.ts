/**
 * Market Data Service
 * Fetches real-time data for TVL, APY, token prices, and market stats
 */

import { ethers, type Provider } from 'ethers'
import { CONTRACTS } from '../config/contracts'

// Mock prices for development (replace with real oracle data)
const MOCK_PRICES: Record<string, number> = {
  BTC: 67500,
  ETH: 3500,
  USDC: 1.0,
  USDT: 1.0,
}

export interface MarketStats {
  totalSupply: string
  totalBorrowed: string
  availableLiquidity: string
  utilizationRate: string
  baseAPY: string
  borrowAPY: string
  tvl: string
  btcPrice: number
  usdcPrice: number
  btcPriceChange24h: number
  usdcPriceChange24h: number
}

export interface TokenPrice {
  symbol: string
  price: number
  change24h: number
}

/**
 * Fetch market overview stats from VeniceFiCore contract
 */
export async function fetchMarketStats(
  provider: Provider
): Promise<MarketStats> {
  try {
    const coreContract = new ethers.Contract(
      CONTRACTS.VeniceFiCore,
      [
        'function getTotalSupply() view returns (uint256)',
        'function getTotalBorrowed() view returns (uint256)',
        'function getUtilizationRate() view returns (uint256)',
        'function getSupplyAPY() view returns (uint256)',
        'function getBorrowAPY() view returns (uint256)',
      ],
      provider
    )

    const [totalSupply, totalBorrowed, utilizationRate, supplyAPY, borrowAPY] =
      await Promise.all([
        coreContract.getTotalSupply().catch(() => 0n),
        coreContract.getTotalBorrowed().catch(() => 0n),
        coreContract.getUtilizationRate().catch(() => 0n),
        coreContract.getSupplyAPY().catch(() => 0n),
        coreContract.getBorrowAPY().catch(() => 0n),
      ])

    const totalSupplyFormatted = ethers.formatUnits(totalSupply, 6)
    const totalBorrowedFormatted = ethers.formatUnits(totalBorrowed, 6)
    const availableLiquidity = totalSupply - totalBorrowed

    return {
      totalSupply: totalSupplyFormatted,
      totalBorrowed: totalBorrowedFormatted,
      availableLiquidity: ethers.formatUnits(availableLiquidity, 6),
      utilizationRate: ethers.formatUnits(utilizationRate, 2), // Assuming 2 decimals for percentage
      baseAPY: ethers.formatUnits(supplyAPY, 2),
      borrowAPY: ethers.formatUnits(borrowAPY, 2),
      tvl: (parseFloat(totalSupplyFormatted) * MOCK_PRICES.USDC).toFixed(2),
      btcPrice: MOCK_PRICES.BTC,
      usdcPrice: MOCK_PRICES.USDC,
      btcPriceChange24h: 2.5,
      usdcPriceChange24h: 0.01,
    }
  } catch (error) {
    console.error('Error fetching market stats:', error)
    // Return mock data for development
    return {
      totalSupply: '1250000',
      totalBorrowed: '875000',
      availableLiquidity: '375000',
      utilizationRate: '70.00',
      baseAPY: '8.50',
      borrowAPY: '12.25',
      tvl: '1250000',
      btcPrice: MOCK_PRICES.BTC,
      usdcPrice: MOCK_PRICES.USDC,
      btcPriceChange24h: 2.5,
      usdcPriceChange24h: 0.01,
    }
  }
}

/**
 * Fetch token prices from oracle or external API
 */
export async function fetchTokenPrices(
  provider: Provider
): Promise<Record<string, TokenPrice>> {
  try {
    // TODO: Integrate with real oracle contract
    // const oracleContract = new ethers.Contract(
    //   CONTRACTS.MockOracle,
    //   ['function getPrice(address token) view returns (uint256)'],
    //   provider
    // )

    // For now, return mock data with simulated 24h changes
    return {
      BTC: {
        symbol: 'BTC',
        price: MOCK_PRICES.BTC,
        change24h: 2.5,
      },
      ETH: {
        symbol: 'ETH',
        price: MOCK_PRICES.ETH,
        change24h: -1.2,
      },
      USDC: {
        symbol: 'USDC',
        price: MOCK_PRICES.USDC,
        change24h: 0.01,
      },
      USDT: {
        symbol: 'USDT',
        price: MOCK_PRICES.USDT,
        change24h: -0.02,
      },
    }
  } catch (error) {
    console.error('Error fetching token prices:', error)
    return {
      BTC: { symbol: 'BTC', price: MOCK_PRICES.BTC, change24h: 0 },
      ETH: { symbol: 'ETH', price: MOCK_PRICES.ETH, change24h: 0 },
      USDC: { symbol: 'USDC', price: MOCK_PRICES.USDC, change24h: 0 },
      USDT: { symbol: 'USDT', price: MOCK_PRICES.USDT, change24h: 0 },
    }
  }
}

/**
 * Calculate user's portfolio value in USD
 */
export function calculatePortfolioValue(
  balances: Record<string, string>,
  prices: Record<string, TokenPrice>
): number {
  let total = 0

  // BTC tokens
  const btcBalance =
    parseFloat(balances.BTC || '0') + parseFloat(balances.WBTC || '0')
  total += btcBalance * (prices.BTC?.price || 0)

  // Stablecoins
  total += parseFloat(balances.USDC || '0') * (prices.USDC?.price || 1)
  total += parseFloat(balances.USDT || '0') * (prices.USDT?.price || 1)
  total += parseFloat(balances.CENT || '0') * (prices.USDC?.price || 1)

  return total
}

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatCompactNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`
  }
  return num.toFixed(2)
}

/**
 * Format percentage with + or - sign
 */
export function formatPercentageChange(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

/**
 * Calculate APY from base rate and incentives
 */
export function calculateTotalAPY(
  baseAPY: number,
  incentiveAPY: number = 0
): number {
  return baseAPY + incentiveAPY
}

