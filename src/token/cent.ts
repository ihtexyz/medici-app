import { getEnvOptional as getEnv } from "../lib/runtime-env"

// Lazy-load the address to avoid accessing env vars at module init time
let _centAddress: string | undefined

function getCentAddress(): string {
  if (!_centAddress) {
    _centAddress = getEnv("VITE_CENT_ADDRESS") || "0x0000000000000000000000000000000000000000"
  }
  return _centAddress
}

export const CENT = {
  symbol: "CENT",
  decimals: 18,
  get address() {
    return getCentAddress()
  },
} as const

export { default as CentErc20Abi } from "centaurusfi-integration/contracts/evm/cent-token/abi.json"
