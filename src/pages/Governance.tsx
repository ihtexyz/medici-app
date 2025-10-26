import { useState } from "react"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { Link } from "react-router-dom"

import { getBranches } from "../config/cent"
import { useAllPrices } from "../hooks/useAllPrices"
import { useAllTroves } from "../hooks/useAllTroves"

/**
 * Governance Page
 *
 * Shows protocol parameters, statistics, and governance information.
 * Future: Will include proposal voting and parameter adjustments.
 */
export default function Governance() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { activeTroves } = useAllTroves(address)
  const { prices } = useAllPrices()
  const [activeTab, setActiveTab] = useState<'overview' | 'parameters' | 'resources'>('overview')

  const branches = getBranches()

  // Not connected
  if (!isConnected) {
    return (
      <div style={{
        paddingLeft: 'var(--cb-space-lg)',
        paddingRight: 'var(--cb-space-lg)',
        paddingTop: 'var(--cb-space-2xl)',
        paddingBottom: 'var(--cb-space-lg)',
        maxWidth: '480px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '64px', marginBottom: 'var(--cb-space-lg)' }}>🏛️</div>
        <h2 className="cb-title" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Protocol Governance
        </h2>
        <p className="cb-body" style={{
          color: 'var(--cb-text-secondary)',
          marginBottom: 'var(--cb-space-xl)',
        }}>
          Connect your wallet to view protocol parameters and governance information
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
        <h1 className="cb-title">Governance</h1>
        <p className="cb-caption" style={{ marginTop: 'var(--cb-space-xs)' }}>
          Protocol parameters and governance overview
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--cb-space-sm)',
        marginBottom: 'var(--cb-space-lg)',
        borderBottom: '1px solid var(--cb-border)',
        paddingBottom: 'var(--cb-space-sm)',
      }}>
        <button
          className="cb-btn cb-btn-tertiary"
          onClick={() => setActiveTab('overview')}
          style={{
            flex: 1,
            background: activeTab === 'overview' ? 'var(--cb-surface-secondary)' : 'transparent',
          }}
        >
          Overview
        </button>
        <button
          className="cb-btn cb-btn-tertiary"
          onClick={() => setActiveTab('parameters')}
          style={{
            flex: 1,
            background: activeTab === 'parameters' ? 'var(--cb-surface-secondary)' : 'transparent',
          }}
        >
          Parameters
        </button>
        <button
          className="cb-btn cb-btn-tertiary"
          onClick={() => setActiveTab('resources')}
          style={{
            flex: 1,
            background: activeTab === 'resources' ? 'var(--cb-surface-secondary)' : 'transparent',
          }}
        >
          Resources
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Protocol Stats */}
          <div className="cb-card" style={{
            padding: 'var(--cb-space-lg)',
            marginBottom: 'var(--cb-space-lg)',
            background: 'linear-gradient(135deg, #5E5CE6 0%, #7C3AED 100%)',
          }}>
            <h3 className="cb-subtitle" style={{ color: 'white', marginBottom: 12 }}>
              Protocol Overview
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cb-space-md)' }}>
              <div>
                <div className="cb-caption" style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: 4 }}>
                  Collateral Types
                </div>
                <div className="cb-body" style={{ color: 'white', fontWeight: 600 }}>
                  {branches.length}
                </div>
              </div>
              <div>
                <div className="cb-caption" style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: 4 }}>
                  Your Positions
                </div>
                <div className="cb-body" style={{ color: 'white', fontWeight: 600 }}>
                  {activeTroves.length}
                </div>
              </div>
            </div>
          </div>

          {/* Governance Model */}
          <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginBottom: 'var(--cb-space-lg)' }}>
            <h3 className="cb-subtitle" style={{ marginBottom: 12 }}>Governance Model</h3>
            <p className="cb-body" style={{ marginBottom: 12 }}>
              CENT Protocol follows the Liquity V2 architecture with minimal governance:
            </p>
            <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
              <li className="cb-caption" style={{ marginBottom: 8 }}>
                <strong>Immutable Core:</strong> Core protocol contracts are immutable and non-upgradeable
              </li>
              <li className="cb-caption" style={{ marginBottom: 8 }}>
                <strong>User Control:</strong> Users set their own interest rates (1-10% APR)
              </li>
              <li className="cb-caption" style={{ marginBottom: 8 }}>
                <strong>Market-Driven:</strong> Redemptions create natural interest rate discovery
              </li>
              <li className="cb-caption">
                <strong>Decentralized:</strong> No admin keys or central authority
              </li>
            </ul>
          </div>

          {/* Your Participation */}
          <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginBottom: 'var(--cb-space-lg)' }}>
            <h3 className="cb-subtitle" style={{ marginBottom: 12 }}>Your Participation</h3>

            {activeTroves.length > 0 ? (
              <>
                <div className="cb-body" style={{ marginBottom: 12 }}>
                  You have {activeTroves.length} active Trove{activeTroves.length > 1 ? 's' : ''}
                </div>
                <Link to="/borrow" style={{ textDecoration: 'none' }}>
                  <button className="cb-btn cb-btn-secondary">
                    Manage Positions →
                  </button>
                </Link>
              </>
            ) : (
              <>
                <div className="cb-body" style={{ marginBottom: 12 }}>
                  You don't have any active Trove positions yet.
                </div>
                <Link to="/borrow" style={{ textDecoration: 'none' }}>
                  <button className="cb-btn cb-btn-primary">
                    Open a Trove →
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Protocol Security */}
          <div className="cb-card" style={{
            padding: 'var(--cb-space-md)',
            background: 'rgba(52, 199, 89, 0.05)',
            border: '1px solid rgba(52, 199, 89, 0.2)',
          }}>
            <div className="cb-caption">
              🔒 <strong>Security First:</strong> CENT Protocol is based on battle-tested Liquity V2
              architecture with no admin keys or centralized control points.
            </div>
          </div>
        </div>
      )}

      {/* Parameters Tab */}
      {activeTab === 'parameters' && (
        <div>
          <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginBottom: 'var(--cb-space-lg)' }}>
            <h3 className="cb-subtitle" style={{ marginBottom: 12 }}>Global Parameters</h3>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div className="cb-caption">Min Debt Amount</div>
                <div className="cb-body cb-mono">2,000 CENT</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div className="cb-caption">Gas Compensation</div>
                <div className="cb-body cb-mono">200 CENT</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div className="cb-caption">Interest Rate Range</div>
                <div className="cb-body cb-mono">0.5% - 25% APR</div>
              </div>
            </div>
          </div>

          {/* Collateral-Specific Parameters */}
          {branches.map((branch) => (
            <div key={branch.collSymbol} className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginBottom: 'var(--cb-space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  ₿
                </div>
                <div>
                  <div className="cb-body" style={{ fontWeight: 600 }}>{branch.collSymbol}</div>
                  {prices[branch.collSymbol] && (
                    <div className="cb-caption">${prices[branch.collSymbol]}</div>
                  )}
                </div>
              </div>

              <div style={{ paddingTop: 12, borderTop: '1px solid var(--cb-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div className="cb-caption">Minimum CR (MCR)</div>
                  <div className="cb-body cb-mono">120%</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div className="cb-caption">Critical CR (CCR)</div>
                  <div className="cb-body cb-mono">150%</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div className="cb-caption">Liquidation Penalty (SP)</div>
                  <div className="cb-body cb-mono">5%</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="cb-caption">Liquidation Penalty (Redistribution)</div>
                  <div className="cb-body cb-mono">10%</div>
                </div>
              </div>
            </div>
          ))}

          <div className="cb-card" style={{
            padding: 'var(--cb-space-md)',
            background: 'rgba(94, 92, 230, 0.05)',
            border: '1px solid rgba(94, 92, 230, 0.2)',
          }}>
            <div className="cb-caption">
              ℹ️ These parameters are hardcoded in the immutable smart contracts and
              cannot be changed without redeployment.
            </div>
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div>
          {/* Documentation */}
          <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginBottom: 'var(--cb-space-lg)' }}>
            <h3 className="cb-subtitle" style={{ marginBottom: 12 }}>Documentation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a
                href="https://liquity.gitbook.io/v2-whitepaper"
                target="_blank"
                rel="noopener noreferrer"
                className="cb-body"
                style={{ color: 'var(--cb-primary)', textDecoration: 'none' }}
              >
                📄 Liquity V2 Whitepaper →
              </a>
              <a
                href="https://github.com/liquity/bold"
                target="_blank"
                rel="noopener noreferrer"
                className="cb-body"
                style={{ color: 'var(--cb-primary)', textDecoration: 'none' }}
              >
                💻 Protocol GitHub →
              </a>
              <a
                href="https://hyperliquid.gitbook.io/hyperliquid-docs/hyperevm"
                target="_blank"
                rel="noopener noreferrer"
                className="cb-body"
                style={{ color: 'var(--cb-primary)', textDecoration: 'none' }}
              >
                🔗 HyperEVM Documentation →
              </a>
            </div>
          </div>

          {/* Key Concepts */}
          <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginBottom: 'var(--cb-space-lg)' }}>
            <h3 className="cb-subtitle" style={{ marginBottom: 12 }}>Key Concepts</h3>

            <div style={{ marginBottom: 16 }}>
              <div className="cb-body" style={{ fontWeight: 600, marginBottom: 4 }}>
                Interest Rate Setting
              </div>
              <div className="cb-caption">
                You control your own interest rate (1-10% APR). Lower rates risk earlier redemption,
                higher rates cost more but provide protection.
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div className="cb-body" style={{ fontWeight: 600, marginBottom: 4 }}>
                Redemptions
              </div>
              <div className="cb-caption">
                Anyone can exchange CENT for collateral at face value. Troves with lowest interest
                rates are redeemed from first.
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div className="cb-body" style={{ fontWeight: 600, marginBottom: 4 }}>
                Liquidations
              </div>
              <div className="cb-caption">
                If your collateral ratio falls below MCR (120%), your Trove can be liquidated.
                Keep CR above 150% for safety.
              </div>
            </div>

            <div>
              <div className="cb-body" style={{ fontWeight: 600, marginBottom: 4 }}>
                Stability Pool
              </div>
              <div className="cb-caption">
                Deposit CENT to absorb liquidations and earn collateral gains. Provides guaranteed
                yields from liquidation penalties.
              </div>
            </div>
          </div>

          {/* Community */}
          <div className="cb-card" style={{ padding: 'var(--cb-space-lg)' }}>
            <h3 className="cb-subtitle" style={{ marginBottom: 12 }}>Community</h3>
            <div className="cb-body" style={{ marginBottom: 12 }}>
              Join the community to discuss protocol improvements, share strategies, and stay updated.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a
                href="https://discord.gg/hyperliquid"
                target="_blank"
                rel="noopener noreferrer"
                className="cb-body"
                style={{ color: 'var(--cb-primary)', textDecoration: 'none' }}
              >
                💬 Discord →
              </a>
              <a
                href="https://twitter.com/HyperliquidX"
                target="_blank"
                rel="noopener noreferrer"
                className="cb-body"
                style={{ color: 'var(--cb-primary)', textDecoration: 'none' }}
              >
                🐦 Twitter →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
