import { Link } from "react-router-dom"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

import useCentBalance from "../hooks/useCentBalance"
import { useTrove } from "../hooks/useTrove"
import { useStabilityPool } from "../hooks/useStabilityPool"
import { getBranches } from "../config/cent"

/**
 * Dashboard Page - USDaf Style
 * Features:
 * - Total CENT balance at top
 * - Active borrow positions (troves)
 * - Stability pool deposits
 * - Quick actions to Borrow and Earn
 */
export default function Overview() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { balance } = useCentBalance()

  const branches = getBranches()

  // Load trove data for each branch
  const wbtcTrove = useTrove("WBTC18", address)
  const cbBtcTrove = useTrove("cbBTC18", address)

  // Load stability pool data for each branch
  const wbtcSP = useStabilityPool("WBTC18", address)
  const cbBtcSP = useStabilityPool("cbBTC18", address)

  const hasWbtcTrove = wbtcTrove.data && wbtcTrove.data.entireDebt > 0n
  const hasCbBtcTrove = cbBtcTrove.data && cbBtcTrove.data.entireDebt > 0n
  const hasWbtcSP = parseFloat(wbtcSP.deposit) > 0
  const hasCbBtcSP = parseFloat(cbBtcSP.deposit) > 0

  const hasAnyPosition = hasWbtcTrove || hasCbBtcTrove || hasWbtcSP || hasCbBtcSP

  // Not connected state
  if (!isConnected || !address) {
    return (
      <div style={{
        padding: 'var(--cb-space-lg)',
        maxWidth: '480px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{ paddingTop: 'var(--cb-space-2xl)', paddingBottom: 'var(--cb-space-xl)' }}>
          <div style={{ fontSize: 64, marginBottom: 'var(--cb-space-md)' }}>🏦</div>
          <h2 className="cb-title" style={{ marginBottom: 'var(--cb-space-xs)' }}>
            Bitcoin Banking
          </h2>
          <p className="cb-body" style={{ color: 'var(--cb-text-secondary)', marginBottom: 'var(--cb-space-lg)' }}>
            Borrow stablecoins against BTC, earn yields, and more
          </p>
          <button className="cb-btn cb-btn-primary" onClick={() => open()}>
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      padding: 'var(--cb-space-lg)',
      maxWidth: '480px',
      margin: '0 auto',
    }}>
      {/* Balance Section */}
      <div style={{
        textAlign: 'center',
        paddingTop: 'var(--cb-space-xl)',
        paddingBottom: 'var(--cb-space-lg)',
      }}>
        <div className="balance-large">
          ${balance !== null ? (Number(balance) / 1e6).toFixed(2) : '0.00'}
        </div>
        <div className="cb-caption" style={{ marginTop: 'var(--cb-space-sm)' }}>
          CENT Balance
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions" style={{ marginBottom: 'var(--cb-space-xl)' }}>
        <Link to="/borrow" className="quick-action">
          <div className="quick-action-icon">💳</div>
          <div className="quick-action-label">Borrow</div>
        </Link>

        <Link to="/earn" className="quick-action">
          <div className="quick-action-icon">📈</div>
          <div className="quick-action-label">Earn</div>
        </Link>
      </div>

      {/* Active Positions */}
      {hasAnyPosition ? (
        <div style={{ marginBottom: 'var(--cb-space-xl)' }}>
          <h3 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>
            Your Positions
          </h3>

          {/* Borrow Positions */}
          {(hasWbtcTrove || hasCbBtcTrove) && (
            <div className="cb-card" style={{ padding: 'var(--cb-space-md)', marginBottom: 'var(--cb-space-md)' }}>
              <div className="cb-caption" style={{ marginBottom: 'var(--cb-space-sm)' }}>Borrow Positions</div>

              {hasWbtcTrove && wbtcTrove.data && (
                <div style={{ marginBottom: hasWbtcTrove && hasCbBtcTrove ? 'var(--cb-space-sm)' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="cb-body">WBTC</div>
                      <div className="cb-caption">
                        Collateral: {(Number(wbtcTrove.data.entireColl) / 1e18).toFixed(6)} BTC
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="cb-body cb-mono">
                        {(Number(wbtcTrove.data.entireDebt) / 1e18).toFixed(2)} CENT
                      </div>
                      <div className="cb-caption">
                        {(Number(wbtcTrove.data.annualInterestRate) / 1e16).toFixed(2)}% APR
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {hasCbBtcTrove && cbBtcTrove.data && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="cb-body">cbBTC</div>
                      <div className="cb-caption">
                        Collateral: {(Number(cbBtcTrove.data.entireColl) / 1e18).toFixed(6)} BTC
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="cb-body cb-mono">
                        {(Number(cbBtcTrove.data.entireDebt) / 1e18).toFixed(2)} CENT
                      </div>
                      <div className="cb-caption">
                        {(Number(cbBtcTrove.data.annualInterestRate) / 1e16).toFixed(2)}% APR
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stability Pool Positions */}
          {(hasWbtcSP || hasCbBtcSP) && (
            <div className="cb-card" style={{ padding: 'var(--cb-space-md)' }}>
              <div className="cb-caption" style={{ marginBottom: 'var(--cb-space-sm)' }}>Stability Pool</div>

              {hasWbtcSP && (
                <div style={{ marginBottom: hasWbtcSP && hasCbBtcSP ? 'var(--cb-space-sm)' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="cb-body">WBTC Pool</div>
                      <div className="cb-caption">BTC Gains: {wbtcSP.collGain}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="cb-body cb-mono">{wbtcSP.deposit} CENT</div>
                    </div>
                  </div>
                </div>
              )}

              {hasCbBtcSP && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="cb-body">cbBTC Pool</div>
                      <div className="cb-caption">BTC Gains: {cbBtcSP.collGain}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="cb-body cb-mono">{cbBtcSP.deposit} CENT</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* No Positions - Show Get Started CTA */
        <div className="cb-card" style={{
          padding: 'var(--cb-space-xl)',
          marginBottom: 'var(--cb-space-xl)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 'var(--cb-space-sm)' }}>🚀</div>
          <h3 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-xs)' }}>
            Get Started
          </h3>
          <p className="cb-caption" style={{ marginBottom: 'var(--cb-space-md)' }}>
            Borrow CENT against BTC or deposit CENT to earn yields
          </p>
          <div style={{ display: 'flex', gap: 'var(--cb-space-sm)' }}>
            <Link to="/borrow" className="cb-btn cb-btn-primary" style={{ flex: 1 }}>
              Borrow
            </Link>
            <Link to="/earn" className="cb-btn cb-btn-tertiary" style={{ flex: 1 }}>
              Earn
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
