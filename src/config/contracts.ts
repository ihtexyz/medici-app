/**
 * Shared contract configuration for Medici dApp
 * Venice Fi deployment addresses on Arbitrum Sepolia testnet
 */

export const CHAIN_ID = 421614

// Export all contract addresses (Arbitrum Sepolia Testnet)
// Source: evm-lending-clob-contracts/feature/evm-testnet
export const CONTRACTS = {
  // Core Protocol
  VeniceFiCore: '0xF6A441Bfc8a3e07Af46b34fA7C791F8373e2bb0B',
  LiquidationEngine: '0x71f4C749b910625604a8d9Ad012e12dee11B41F0',
  SecurityModule: '0x521D616218682E6EC552a04a401C1009190Daff5',
  AssetRegistry: '0x4abFD8A9Fe347891A75dD04ab4e2fF9e714c2357',
  Market: '0x52278fF3549fd908E2516f6E379957534D3900B9',
  MarketFactory: '0x2ae911973Da97bB2db7ACEF09C9Bf205abFCF465',
  
  // Mock Tokens
  MockUSDC: '0xad1630074C46AD9918860B61FF37F6C45853fb6C',
  MockUSDT: '0x601028704e2d3c5b70DD735eE18AdEeef988a269', // Using USDC as USDT placeholder
  MockWETH: '0x6FdF515fb5a882F7128752CaD1C142c166737dfC',
  MockWBTC: '0x83f7f5dEd767090547E3f1C7797b8402fdD12121',
  MockCBTC: '0x64EA0C3f360ee868995cdB4278EdF38811Ad5A9f',
  MockZBTC: '0x756A665a66Cf4db32419e1f86270576F9ee4db56', // Placeholder
  MockSBTC: '0x5A0D7C5c27c71c7a78a86f8B7334ce5acf49a0f6', // Placeholder
  MockXBTC: '0xFeBbBd9A9fA80dA121Df18cacAD1b26db224f7B0', // Placeholder
  
  // Oracle
  MockOracle: '0xFfd5ACa0714f650D1F9CA78cAE3c55fd1FBab89E',
} as const

export type ContractKeys = keyof typeof CONTRACTS

// Stablecoin addresses
export const STABLES: readonly string[] = [
  CONTRACTS.MockUSDC,
  CONTRACTS.MockUSDT,
] as const

// BTC token addresses
export const BTC_TOKENS: readonly string[] = [
  CONTRACTS.MockWBTC,
  CONTRACTS.MockCBTC,
  CONTRACTS.MockZBTC,
  CONTRACTS.MockSBTC,
  CONTRACTS.MockXBTC,
] as const

// Helper to check if an address is a stablecoin
export function isStablecoin(address: string): boolean {
  return STABLES.includes(address.toLowerCase())
}

// Helper to check if an address is a BTC token
export function isBtcToken(address: string): boolean {
  return BTC_TOKENS.includes(address.toLowerCase())
}

// Deployment metadata for reference
export const deployment = {
  network: 'arbitrumSepolia',
  chainId: 421614,
  contracts: CONTRACTS,
  deployer: '0xc0EC48bA812d9D9B11D6E39aC2D2237CC0E937E8',
  timestamp: '2025-09-01T16:08:35.401Z',
} as const
