export const SUPPORTED_CHAINS = [
  { id: "bitcoin", label: "Bitcoin", native: "BTC" },
  { id: "ethereum", label: "Ethereum", native: "ETH" },
  { id: "solana", label: "Solana", native: "SOL" },
  { id: "zcash", label: "Zcash", native: "ZEC" },
  { id: "near", label: "Near", native: "NEAR" },
  { id: "cent", label: "Venice CENT", native: "CENT" },
] as const

export const DESTINATION_USE_CASES = [
  { id: "wallet", label: "Wallet transfer" },
  { id: "merchant", label: "Merchant payment" },
  { id: "offramp", label: "Off-ramp / Fiat settlement" },
  { id: "giftcards", label: "Gift cards via Venice" },
] as const
