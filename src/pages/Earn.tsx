import { useEffect, useState } from "react"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { Contract } from "ethers"

import { getBranches, CENT_ADDRESSES } from "../config/cent"
import useWallet from "../hooks/useWallet"
import { getEnvOptional as getEnv } from "../lib/runtime-env"
import { useStabilityPool } from "../hooks/useStabilityPool"
import { usePoolStats } from "../hooks/usePoolStats"
import { spDeposit, spWithdraw, faucetTap } from "../services/cent"

const ERC20_ABI = [
  { name: "allowance", type: "function", stateMutability: "view", inputs: [
    { name: "owner", type: "address" }, { name: "spender", type: "address" }
  ], outputs: [{ name: "", type: "uint256" }] },
  { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [
    { name: "spender", type: "address" }, { name: "amount", type: "uint256" }
  ], outputs: [{ name: "", type: "bool" }] },
] as const

export default function Earn() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const rpcUrl = getEnv("VITE_RPC_URL")
  const { provider } = useWallet(rpcUrl)

  const branches = getBranches()
  const [collateral, setCollateral] = useState<string>(branches[0]?.collSymbol || "WBTC18")
  const [amount, setAmount] = useState<string>("")
  const [status, setStatus] = useState<string | null>(null)
  const [faucetStatus, setFaucetStatus] = useState<string | null>(null)
  const [needsApproval, setNeedsApproval] = useState<boolean>(false)
  const [approving, setApproving] = useState<boolean>(false)

  const sp = useStabilityPool(collateral, address || undefined)
  const poolStats = usePoolStats(collateral, rpcUrl)

  // Check if approval is needed
  useEffect(() => {
    const checkApproval = async () => {
      if (!address || !provider || !CENT_ADDRESSES) return
      try {
        const branch = getBranches().find(b => b.collSymbol === collateral)
        if (!branch) return

        const { ethers } = await import('ethers')
        const signer = await (provider as any).getSigner()
        const centToken = new Contract(CENT_ADDRESSES.boldToken, ERC20_ABI, signer)
        const allowance: bigint = await centToken.allowance(address, branch.stabilityPool)
        const amt = amount ? BigInt(Math.round(parseFloat(amount) * 1e18)) : 0n
        setNeedsApproval(amt > 0n && allowance < amt)
      } catch (e) {
        console.error('Error checking approval:', e)
      }
    }
    checkApproval()
  }, [address, provider, collateral, amount])

  const handleApprove = async () => {
    if (!address || !provider || !CENT_ADDRESSES) return
    try {
      setApproving(true)
      setStatus(null)
      const branch = getBranches().find(b => b.collSymbol === collateral)
      if (!branch) throw new Error("Branch not found")

      const { ethers } = await import('ethers')
      const signer = await (provider as any).getSigner()
      const centToken = new Contract(CENT_ADDRESSES.boldToken, ERC20_ABI, signer)
      const amt = BigInt(Math.round(parseFloat(amount || "0") * 1e18))
      const tx = await centToken.approve(branch.stabilityPool, amt)
      await tx.wait()
      setNeedsApproval(false)
      setStatus("Approved successfully")
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Approval failed")
    } finally {
      setApproving(false)
    }
  }

  const handle = async (op: "deposit" | "withdraw") => {
    if (!isConnected || !provider) {
      open()
      return
    }
    try {
      setStatus(null)
      const amt = BigInt(Math.round(parseFloat(amount || "0") * 1e18))
      if (amt <= 0n) {
        setStatus("Enter a valid amount")
        return
      }
      if (op === "deposit") await spDeposit(provider as any, collateral, amt, true)
      else await spWithdraw(provider as any, collateral, amt, true)
      setStatus(op === "deposit" ? "Deposited" : "Withdrew")
      setAmount("") // Clear amount after success
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Transaction failed")
    }
  }

  if (!isConnected) {
    return (
      <div style={{ paddingLeft: 'var(--cb-space-lg)', paddingRight: 'var(--cb-space-lg)', paddingTop: 'var(--cb-space-2xl)', paddingBottom: 'var(--cb-space-lg)', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🏦</div>
        <h2 className="cb-title" style={{ marginBottom: 8 }}>Earn with Stability Pool</h2>
        <p className="cb-body" style={{ color: 'var(--cb-text-secondary)', marginBottom: 16 }}>Deposit CENT to earn liquidation gains</p>
        <button className="cb-btn cb-btn-primary" onClick={() => open()}>Connect Wallet</button>
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--cb-space-lg)', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--cb-space-xl)' }}>
        <h1 className="cb-title" style={{ marginBottom: 4 }}>Stability Pool</h1>
        <p className="cb-caption">Deposit CENT to earn BTC gains from liquidations</p>
      </div>

      <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginBottom: 'var(--cb-space-lg)' }}>
        <div className="cb-caption" style={{ marginBottom: 8 }}>Collateral Branch</div>
        <select value={collateral} onChange={(e) => setCollateral(e.target.value)}>
          {branches.map(b => (
            <option key={b.collSymbol} value={b.collSymbol}>{b.collSymbol}</option>
          ))}
        </select>
        <div className="cb-caption" style={{ marginTop: 12, marginBottom: 8 }}>CENT Amount</div>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {needsApproval ? (
            <button className="cb-btn cb-btn-primary" onClick={handleApprove} disabled={approving} style={{ flex: 1 }}>
              {approving ? 'Approving...' : 'Approve CENT'}
            </button>
          ) : (
            <button className="cb-btn cb-btn-primary" onClick={() => handle("deposit")}>Deposit</button>
          )}
          <button className="cb-btn cb-btn-tertiary" onClick={() => handle("withdraw")}>Withdraw</button>
        </div>
        {status && <div className="cb-caption" style={{ marginTop: 8, color: status.includes('success') || status.includes('Deposited') || status.includes('Withdrew') || status.includes('Approved') ? 'var(--cb-green)' : 'var(--cb-red)' }}>{status}</div>}
      </div>

      <div className="cb-card" style={{ padding: 'var(--cb-space-lg)' }}>
        <h3 className="cb-subtitle" style={{ marginBottom: 8 }}>Your Position</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <div className="cb-caption">Deposit</div>
          <div className="cb-body cb-mono">{sp.loading ? '…' : sp.deposit} CENT</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <div className="cb-caption">BTC Gains</div>
          <div className="cb-body cb-mono" style={{ color: 'var(--cb-green)' }}>
            +{sp.loading ? '…' : sp.collGain} BTC
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="cb-caption">CENT Yield</div>
          <div className="cb-body cb-mono" style={{ color: 'var(--cb-green)' }}>
            +{sp.loading ? '…' : sp.yieldGain} CENT
          </div>
        </div>

        {/* Claim Gains Button */}
        {((parseFloat(sp.collGain) > 0) || (parseFloat(sp.yieldGain) > 0)) && (
          <button
            className="cb-btn cb-btn-primary"
            onClick={async () => {
              try {
                setStatus(null)
                // Withdraw 0 but claim gains
                await spWithdraw(provider as any, collateral, 0n, true)
                setStatus("Claimed gains successfully!")
              } catch (e) {
                setStatus(e instanceof Error ? e.message : "Failed to claim gains")
              }
            }}
            style={{ width: '100%' }}
          >
            Claim Gains
          </button>
        )}
      </div>

      {/* Pool Statistics */}
      <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginTop: 'var(--cb-space-lg)' }}>
        <h3 className="cb-subtitle" style={{ marginBottom: 12 }}>Pool Statistics</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cb-space-md)', marginBottom: 16 }}>
          <div>
            <div className="cb-caption" style={{ marginBottom: 4 }}>Total Deposits</div>
            <div className="cb-body cb-mono" style={{ fontSize: 18, fontWeight: 600 }}>
              {poolStats.loading ? '…' : poolStats.totalDeposits} CENT
            </div>
          </div>

          <div>
            <div className="cb-caption" style={{ marginBottom: 4 }}>Estimated APR</div>
            <div className="cb-body cb-mono" style={{ fontSize: 18, fontWeight: 600, color: 'var(--cb-green)' }}>
              {poolStats.loading ? '…' : poolStats.estimatedAPR.toFixed(2)}%
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cb-space-md)', marginBottom: 16 }}>
          <div>
            <div className="cb-caption" style={{ marginBottom: 4 }}>Pending Yield</div>
            <div className="cb-body cb-mono" style={{ fontSize: 14 }}>
              {poolStats.loading ? '…' : poolStats.yieldGainsPending} CENT
            </div>
          </div>

          <div>
            <div className="cb-caption" style={{ marginBottom: 4 }}>Total Yield Owed</div>
            <div className="cb-body cb-mono" style={{ fontSize: 14 }}>
              {poolStats.loading ? '…' : poolStats.yieldGainsOwed} CENT
            </div>
          </div>
        </div>

        {poolStats.error && (
          <div className="cb-caption" style={{ color: 'var(--cb-red)', marginBottom: 12 }}>
            {poolStats.error}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginTop: 'var(--cb-space-lg)' }}>
        <h3 className="cb-subtitle" style={{ marginBottom: 12 }}>How It Works</h3>
        <div style={{ marginBottom: 8 }}>
          <div className="cb-caption" style={{ marginBottom: 4, fontWeight: 600 }}>
            📊 Earn from Liquidations
          </div>
          <p className="cb-caption" style={{ color: 'var(--cb-text-secondary)' }}>
            When unhealthy troves are liquidated, their collateral is distributed to stability pool depositors.
            You receive BTC at a discount while your CENT deposit absorbs the debt.
          </p>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div className="cb-caption" style={{ marginBottom: 4, fontWeight: 600 }}>
            💰 Earn Interest Yield
          </div>
          <p className="cb-caption" style={{ color: 'var(--cb-text-secondary)' }}>
            A portion of the interest paid by borrowers flows to the stability pool.
            This continuous yield is paid in CENT.
          </p>
        </div>
        <div>
          <div className="cb-caption" style={{ marginBottom: 4, fontWeight: 600 }}>
            ⚡ No Lock-Up Period
          </div>
          <p className="cb-caption" style={{ color: 'var(--cb-text-secondary)' }}>
            Withdraw your deposit anytime. Claim gains independently or compound them back into your position.
          </p>
        </div>
      </div>

      {/* Testnet Faucet */}
      <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginTop: 'var(--cb-space-lg)' }}>
        <h3 className="cb-subtitle" style={{ marginBottom: 8 }}>Testnet Faucet</h3>
        <p className="cb-caption" style={{ marginBottom: 12 }}>
          Get testnet CENT tokens for testing the Stability Pool.
        </p>
        <button
          className="cb-btn cb-btn-tertiary"
          onClick={async () => {
            try {
              setFaucetStatus(null)
              const { ethers } = await import('ethers')
              const provider = new ethers.BrowserProvider((window as any).ethereum)
              await faucetTap(provider as any, 'CENT')
              setFaucetStatus('Received 1000 CENT')
            } catch (e) {
              setFaucetStatus(e instanceof Error ? e.message : 'CENT faucet failed')
            }
          }}
        >
          Get CENT Tokens
        </button>
        {faucetStatus && <div className="cb-caption" style={{ marginTop: 8 }}>{faucetStatus}</div>}
      </div>
    </div>
  )
}


