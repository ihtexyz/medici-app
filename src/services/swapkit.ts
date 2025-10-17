import { getEnvOptional } from "../lib/runtime-env"

export type SwapQuote = {
  id: string
  fromChain: string
  toChain: string
  amountIn: number
  estimatedOut: number
  feeUsd: number
  provider: string
  durationSeconds: number
  txsRequired: number
  expiresAt?: number
}

export type GetQuoteParams = {
  fromChain: string
  toChain: string
  amount: number
  useCase?: string
  fromTokenSymbol?: "CENT" | "USDC" | "WETH" | "WBTC"
  toTokenSymbol?: "CENT" | "USDC" | "WETH" | "WBTC"
}

/**
 * Get a swap quote using SwapKit API or fallback to mock for development
 */
export async function getQuote(params: GetQuoteParams): Promise<SwapQuote> {
  const { fromChain, toChain, amount, fromTokenSymbol, toTokenSymbol } = params
  const apiKey = getEnvOptional("VITE_SWAPKIT_API_KEY")
  const projectId = getEnvOptional("VITE_SWAPKIT_PROJECT_ID")

  // If SwapKit credentials are configured, use real API
  if (apiKey && projectId) {
    try {
      return await getRealSwapKitQuote(params, apiKey, projectId)
    } catch (error) {
      console.error("SwapKit API error, falling back to mock:", error)
      // Fall through to mock implementation
    }
  }

  // Mock implementation for development/testing
  return getMockQuote(params)
}

/**
 * Real SwapKit API integration
 */
async function getRealSwapKitQuote(
  params: GetQuoteParams,
  apiKey: string,
  projectId: string
): Promise<SwapQuote> {
  const { fromChain, toChain, amount, fromTokenSymbol, toTokenSymbol } = params

  // Normalize chain inputs and map to SwapKit identifiers
  const normalize = (v: string) => v.toLowerCase().trim()
  const chainMap: Record<string, string> = {
    eth: "ETH",
    ethereum: "ETH",
    arbitrum: "ARB",
    arb: "ARB",
    bitcoin: "BTC",
    btc: "BTC",
    zcash: "ZEC",
    zec: "ZEC",
  }

  const fromKey = normalize(fromChain)
  const toKey = normalize(toChain)

  // EVM token symbol mapping for common assets
  const tokenSymbol = (sym?: string) => (sym ?? "").toUpperCase()

  const fromAsset = (fromKey === "eth" || fromKey === "ethereum" || fromKey === "arb" || fromKey === "arbitrum") && fromTokenSymbol
    ? `${chainMap[fromKey]}.${tokenSymbol(fromTokenSymbol)}`
    : chainMap[fromKey] || fromKey.toUpperCase()

  const toAsset = (toKey === "eth" || toKey === "ethereum" || toKey === "arb" || toKey === "arbitrum") && toTokenSymbol
    ? `${chainMap[toKey]}.${tokenSymbol(toTokenSymbol)}`
    : chainMap[toKey] || toKey.toUpperCase()

  // SwapKit quote API endpoint
  const quoteUrl = `https://api.swapkit.dev/quote`
  
  const response = await fetch(quoteUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "X-Project-ID": projectId,
    },
    body: JSON.stringify({
      sellAsset: fromAsset,
      buyAsset: toAsset,
      sellAmount: amount.toString(),
      senderAddress: "", // Will be filled during execution
      recipientAddress: "", // Will be filled during execution
      affiliateBasisPoints: 0,
    }),
  })

  if (!response.ok) {
    throw new Error(`SwapKit API error: ${response.statusText}`)
  }

  const data = await response.json()

  // Parse SwapKit response into our quote format
  return {
    id: data.quoteId || `${fromChain}-${toChain}-${Date.now()}`,
    fromChain,
    toChain,
    amountIn: amount,
    estimatedOut: parseFloat(data.expectedOutput || "0"),
    feeUsd: parseFloat(data.fees?.total || "0"),
    provider: data.provider || "swapkit",
    durationSeconds: data.estimatedTime || (fromChain === toChain ? 30 : 300),
    txsRequired: data.steps?.length || (fromChain === toChain ? 1 : 2),
    expiresAt: Date.now() + 60000, // 60 seconds
  }
}

/**
 * Mock quote generator for development (when SwapKit credentials not configured)
 */
function getMockQuote(params: GetQuoteParams): SwapQuote {
  const { fromChain, toChain, amount, fromTokenSymbol, toTokenSymbol } = params

  // Simulate network latency
  // Note: This is synchronous now, but still provides realistic data

  // Simple price map (USD) for prototype conversion
  const PRICE_USD: Record<string, number> = {
    BTC: 54000,
    ETH: 3000,
    USDC: 1,
    CENT: 1,
    WETH: 3000,
    WBTC: 54000,
    ZEC: 20,
  }

  const fromAssetSymbol =
    fromChain === "ethereum"
      ? fromTokenSymbol ?? "USDC"
      : fromChain === "bitcoin"
      ? "BTC"
      : fromChain === "zcash"
      ? "ZEC"
      : fromChain.toUpperCase()

  const toAssetSymbol =
    toChain === "ethereum"
      ? toTokenSymbol ?? "USDC"
      : toChain === "bitcoin"
      ? "BTC"
      : toChain === "zcash"
      ? "ZEC"
      : toChain.toUpperCase()

  const fromPrice = PRICE_USD[fromAssetSymbol] ?? 1
  const toPrice = PRICE_USD[toAssetSymbol] ?? 1

  // Convert amount (in from asset units) to to asset units via USD
  const amountUsd = amount * fromPrice

  // Simple spread/fee model for prototype
  const basisPoints = 35 // 0.35%
  const slippageBps = fromChain === toChain ? 10 : 30
  const totalBps = basisPoints + slippageBps
  const outBeforeFee = amountUsd / toPrice
  const estimatedOut = Math.max(0, outBeforeFee * (1 - totalBps / 10_000))
  const feeUsd = Math.max(0.25, (amountUsd * basisPoints) / 10_000)

  return {
    id: `mock-${fromChain}-${toChain}-${Date.now()}`,
    fromChain,
    toChain,
    amountIn: amount,
    estimatedOut,
    feeUsd,
    provider: "mock (dev mode)",
    durationSeconds: fromChain === toChain ? 15 : 180,
    txsRequired: fromChain === toChain ? 1 : 2,
    expiresAt: Date.now() + 60000, // 60 seconds
  }
}

/**
 * Execute a swap using SwapKit SDK or mock for development
 */
export async function executeSwap(
  quote: SwapQuote,
  fromAddress?: string,
  toAddress?: string
): Promise<{ txHash?: string; error?: string }> {
  const apiKey = getEnvOptional("VITE_SWAPKIT_API_KEY")
  const projectId = getEnvOptional("VITE_SWAPKIT_PROJECT_ID")

  // Check if quote has expired
  if (quote.expiresAt && Date.now() > quote.expiresAt) {
    return { error: "Quote expired. Please get a new quote." }
  }

  // If SwapKit credentials are configured, use real API
  if (apiKey && projectId && fromAddress && toAddress) {
    try {
      return await executeRealSwapKitSwap(quote, fromAddress, toAddress, apiKey, projectId)
    } catch (error) {
      console.error("SwapKit execution error, falling back to mock:", error)
      return { error: error instanceof Error ? error.message : "Swap execution failed" }
    }
  }

  // Mock execution for development
  return executeMockSwap(quote)
}

/**
 * Real SwapKit swap execution
 */
async function executeRealSwapKitSwap(
  quote: SwapQuote,
  fromAddress: string,
  toAddress: string,
  apiKey: string,
  projectId: string
): Promise<{ txHash?: string; error?: string }> {
  // SwapKit execute endpoint
  const executeUrl = `https://api.swapkit.dev/swap`

  const response = await fetch(executeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "X-Project-ID": projectId,
    },
    body: JSON.stringify({
      quoteId: quote.id,
      senderAddress: fromAddress,
      recipientAddress: toAddress,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `SwapKit execution failed: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    txHash: data.txHash || data.transactionHash,
  }
}

/**
 * Mock swap execution for development
 */
async function executeMockSwap(quote: SwapQuote): Promise<{ txHash?: string }> {
  // Simulate execution latency
  await new Promise((r) => setTimeout(r, 1200))

  // Return a fake tx hash for UX continuity
  return {
    txHash: `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`,
  }
}

/**
 * Check if a quote is still valid (not expired)
 */
export function isQuoteValid(quote: SwapQuote): boolean {
  if (!quote.expiresAt) return true
  return Date.now() < quote.expiresAt
}

/**
 * Get remaining time for a quote in seconds
 */
export function getQuoteRemainingTime(quote: SwapQuote): number {
  if (!quote.expiresAt) return 60
  const remaining = Math.max(0, quote.expiresAt - Date.now())
  return Math.floor(remaining / 1000)
}
