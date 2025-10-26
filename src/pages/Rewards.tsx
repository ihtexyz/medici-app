import { useState } from "react"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

import useCentBalance from "../hooks/useCentBalance"
import useWallet from "../hooks/useWallet"
import { getBranches } from "../config/cent"
import { getEnvOptional as getEnv } from "../lib/runtime-env"
import { claimRewards } from "../services/execution"
import { fetchRewardClaim } from "../services/rewardsApi"
import { CHAIN_ID } from "../config/contracts"

/**
 * Rewards Page - Coinbase Style
 * Features:
 * - CENT balance and claimable rewards
 * - Claim rewards button
 * - Reward stats and info
 */
export default function Rewards() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const rpcUrl = getEnv("VITE_RPC_URL")
  const { balance, claimable, loading, error } = useCentBalance()
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

  // Not connected
  if (!isConnected) {
    return (
      <div style={{
        padding: 'var(--cb-space-lg)',
        maxWidth: '480px',
        margin: '0 auto',
        textAlign: 'center',
        paddingTop: 'var(--cb-space-2xl)',
      }}>
        <div style={{ fontSize: '64px', marginBottom: 'var(--cb-space-lg)' }}>🎁</div>
        <h2 className="cb-title" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Earn rewards
        </h2>
        <p className="cb-body" style={{
          color: 'var(--cb-text-secondary)',
          marginBottom: 'var(--cb-space-xl)',
        }}>
          Connect your wallet to view and claim your CENT rewards
        </p>
        <button
          className="cb-btn cb-btn-primary"
          onClick={() => open()}
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div style={{
      padding: 'var(--cb-space-lg)',
      maxWidth: '480px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--cb-space-xl)' }}>
        <h1 className="cb-title">Rewards</h1>
        <p className="cb-caption" style={{ marginTop: 'var(--cb-space-xs)' }}>
          Earn CENT by participating in the protocol
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--cb-space-md)',
        marginBottom: 'var(--cb-space-xl)',
      }}>
        <div className="cb-card" style={{ padding: 'var(--cb-space-md)' }}>
          <div className="cb-caption" style={{ marginBottom: 'var(--cb-space-xs)' }}>
            Your CENT
          </div>
          <div className="cb-body" style={{ fontSize: '20px', fontWeight: 600 }}>
            {loading ? '…' : balance || '0'}
          </div>
        </div>

        <div className="cb-card" style={{ padding: 'var(--cb-space-md)' }}>
          <div className="cb-caption" style={{ marginBottom: 'var(--cb-space-xs)' }}>
            Claimable
          </div>
          <div className="cb-body" style={{ fontSize: '20px', fontWeight: 600, color: 'var(--cb-green)' }}>
            {loading ? '…' : claimable || '0'}
          </div>
        </div>
      </div>

      {/* Claim Rewards Card */}
      <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginBottom: 'var(--cb-space-md)' }}>
        <h3 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-xs)' }}>
          Claim CENT Rewards
        </h3>
        <p className="cb-caption" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Claim your accrued CENT rewards from protocol participation
        </p>
        <button
          className="cb-btn cb-btn-primary"
          onClick={handleClaim}
          disabled={claiming || !claimable || claimable === "0"}
          style={{ width: '100%' }}
        >
          {claiming ? 'Claiming…' : 'Claim Rewards'}
        </button>
      </div>

      {/* Status Messages */}
      {(error || claimStatus) && (
        <div className="cb-card" style={{
          padding: 'var(--cb-space-md)',
          marginBottom: 'var(--cb-space-md)',
          background: error ? 'rgba(255, 59, 48, 0.1)' : 'rgba(48, 209, 88, 0.1)',
          border: `1px solid ${error ? 'var(--cb-red)' : 'var(--cb-green)'}`,
        }}>
          <div className="cb-caption" style={{ color: error ? 'var(--cb-red)' : 'var(--cb-green)' }}>
            {error || claimStatus}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="cb-card" style={{
        padding: 'var(--cb-space-lg)',
        background: 'var(--cb-gray-1)',
      }}>
        <div style={{ marginBottom: 'var(--cb-space-md)' }}>
          <h3 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-xs)' }}>
            How to earn
          </h3>
          <p className="cb-caption">
            Earn CENT rewards by:
          </p>
        </div>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}>
          <li className="cb-caption" style={{ marginBottom: 'var(--cb-space-sm)' }}>
            • Depositing to stability pools
          </li>
          <li className="cb-caption" style={{ marginBottom: 'var(--cb-space-sm)' }}>
            • Maintaining active borrow positions
          </li>
          <li className="cb-caption">
            • Participating in governance (coming soon)
          </li>
        </ul>
      </div>
    </div>
  )
}
