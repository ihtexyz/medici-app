import { getEnvOptional } from "../lib/runtime-env"

export type RewardClaimPayload = {
  recipient: string
  claimable: string
  reward: string
  expiry: string
  signature: string
  proof?: string[]
}

export async function fetchRewardClaim(address: string): Promise<RewardClaimPayload | null> {
  const baseUrl = getEnvOptional("VITE_REWARDS_API_URL")
  if (!baseUrl) return null
  const url = `${baseUrl.replace(/\/$/, "")}/claim?address=${encodeURIComponent(address)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Rewards API error: ${res.status}`)
  const data = (await res.json()) as RewardClaimPayload
  return data
}





