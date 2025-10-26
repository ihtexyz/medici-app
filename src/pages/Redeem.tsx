import { useState } from "react"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

import { getBranches } from "../config/cent"

export default function Redeem() {
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const branches = getBranches()
  const [collateral, setCollateral] = useState<string>(branches[0]?.collSymbol || "WBTC18")
  const [centAmount, setCentAmount] = useState<string>("")
  const [status, setStatus] = useState<string | null>(null)

  if (!isConnected) {
    return (
      <div style={{ padding: 'var(--cb-space-lg)', maxWidth: 480, margin: '0 auto', textAlign: 'center', paddingTop: 'var(--cb-space-2xl)' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔄</div>
        <h2 className="cb-title" style={{ marginBottom: 8 }}>Redeem CENT for {collateral}</h2>
        <p className="cb-body" style={{ color: 'var(--cb-text-secondary)', marginBottom: 16 }}>Connect your wallet to redeem</p>
        <button className="cb-btn cb-btn-primary" onClick={() => open()}>Connect Wallet</button>
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--cb-space-lg)', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--cb-space-xl)' }}>
        <h1 className="cb-title" style={{ marginBottom: 4 }}>Redeem</h1>
        <p className="cb-caption">Swap CENT for BTC wrapper collateral</p>
      </div>

      <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginBottom: 'var(--cb-space-lg)' }}>
        <div className="cb-caption" style={{ marginBottom: 8 }}>Collateral</div>
        <select value={collateral} onChange={(e) => setCollateral(e.target.value)}>
          {branches.map(b => (
            <option key={b.collSymbol} value={b.collSymbol}>{b.collSymbol}</option>
          ))}
        </select>
        <div className="cb-caption" style={{ marginTop: 12, marginBottom: 8 }}>CENT Amount</div>
        <input type="number" value={centAmount} onChange={(e) => setCentAmount(e.target.value)} placeholder="0.00" />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="cb-btn cb-btn-primary" onClick={() => setStatus('Not yet implemented')}>Redeem</button>
        </div>
        {status && <div className="cb-caption" style={{ marginTop: 8 }}>{status}</div>}
      </div>
    </div>
  )
}





