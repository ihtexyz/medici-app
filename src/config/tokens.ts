import { getEnvOptional } from "../lib/runtime-env"
import { CONTRACTS } from "./contracts"

export type EvmToken = {
  symbol: "CENT" | "USDC" | "WETH" | "WBTC"
  name: string
  address: string
  decimals: number
}

function buildTokens(): EvmToken[] {
  const tokens: EvmToken[] = []

  const centAddress = getEnvOptional("VITE_CENT_ADDRESS")
  if (centAddress) {
    tokens.push({ symbol: "CENT", name: "Venice CENT", address: centAddress, decimals: 6 })
  }

  tokens.push(
    { symbol: "USDC", name: "USD Coin (mock)", address: CONTRACTS.MockUSDC, decimals: 6 },
    { symbol: "WETH", name: "Wrapped Ether (mock)", address: CONTRACTS.MockWETH, decimals: 18 },
    { symbol: "WBTC", name: "Wrapped Bitcoin (mock)", address: CONTRACTS.MockWBTC, decimals: 8 },
  )

  return tokens
}

export const EVM_TOKENS: EvmToken[] = buildTokens()

export const EVM_TOKEN_SYMBOLS = EVM_TOKENS.map((t) => t.symbol)

export function getTokenBySymbol(symbol: EvmToken["symbol"]): EvmToken | undefined {
  return EVM_TOKENS.find((t) => t.symbol === symbol)
}





