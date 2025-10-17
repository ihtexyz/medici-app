import { useState } from "react"

import useCentBalance from "../hooks/useCentBalance"
import useWallet from "../hooks/useWallet"
import { getEnvOptional as getEnv } from "../lib/runtime-env"
import { claimRewards } from "../services/execution"
import { fetchRewardClaim } from "../services/rewardsApi"
import { CHAIN_ID } from "../config/contracts"

export default function Rewards() {
  const rpcUrl = getEnv("VITE_RPC_URL")
  const { balance, claimable, loading, error, address } = useCentBalance()
  const { provider } = useWallet(rpcUrl)
  const [claimStatus, setClaimStatus] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)

  const handleClaim = async () => {
    if (claiming) return
    if (!provider || !address) {
      setClaimStatus("Connect a wallet to claim rewards.")
      return
    }
    if (!claimable || claimable === "0") {
      setClaimStatus("No rewards available to claim.")
      return
    }
    setClaiming(true)
    setClaimStatus(null)
    try {
      const payload = await fetchRewardClaim(address)
      if (!payload) {
        setClaimStatus("Rewards service not configured. Set VITE_REWARDS_API_URL.")
        return
      }
      const claim = {
        amount: BigInt(0), // not used by contract call
        claimable: BigInt(payload.claimable),
        reward: BigInt(payload.reward),
        expiry: BigInt(payload.expiry),
        proof: payload.proof ?? [],
        signature: payload.signature,
      }
      const receipt = await claimRewards(provider!, claim)
      const base = CHAIN_ID === 421614 ? "https://sepolia.arbiscan.io/tx/" : ""
      const link = base && receipt?.hash ? `${base}${receipt.hash}` : null
      setClaimStatus(
        link ? `Claim confirmed: ${link}` : "Claim confirmed successfully.",
      )
    } catch (err) {
      setClaimStatus(err instanceof Error ? err.message : "Claim failed")
    } finally {
      setClaiming(false)
    }
  }

  return (
    <>
      <section className="hero">
        <div className="hero-lede">Rewards</div>
        <h1 className="hero-title">Earn CENT</h1>
        <p className="hero-sub">
          Lock BTC and participate to earn CENT rewards.
        </p>
      </section>

      <section className="kpi-grid">
        <div className="card">
          <div className="card-label">Your CENT</div>
          <div className="card-value">{loading ? "…" : balance}</div>
        </div>
        <div className="card">
          <div className="card-label">Claimable</div>
          <div className="card-value">{loading ? "…" : claimable}</div>
        </div>
        <div className="card">
          <div className="card-label">Emission Rate</div>
          <div className="card-value">—</div>
        </div>
        <div className="card">
          <div className="card-label">Epoch</div>
          <div className="card-value">—</div>
        </div>
      </section>

      <section className="actions" style={{ marginTop: 16 }}>
        <div className="action-grid">
          <div className="action-card">
            <div className="action-head">
              <div className="action-title">Claim CENT</div>
            </div>
            <div className="action-body">Claim your accrued CENT rewards.</div>
            <div className="action-cta">
              <button
                className="button"
                type="button"
                onClick={handleClaim}
                disabled={claiming}
              >
                {claiming ? "Claiming…" : "Claim CENT"}
              </button>
            </div>
          </div>
          {(error || claimStatus) && (
            <div className="action-card">
              <div className="action-head">
                <div className="action-title">Status</div>
              </div>
              <div className="action-body" style={{ color: "#ff7a7a" }}>
                {error || claimStatus}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
