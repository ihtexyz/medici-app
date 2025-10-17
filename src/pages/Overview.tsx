import { Link } from "react-router-dom"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

import { getEnvOptional as getEnv } from "../lib/runtime-env"
import useCentBalance from "../hooks/useCentBalance"
import { useMarketData } from "../hooks/useMarketData"

/**
 * Overview/Home Page - Coinbase Style
 * Features:
 * - Large balance display at top
 * - Quick action buttons (Buy, Receive)
 * - "Fund your account" CTA card
 * - Simple, clean mobile-first design
 */
export default function Overview() {
  const rpcUrl = getEnv("VITE_RPC_URL") || "unset"
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { balance } = useCentBalance()
  const { stats, loading: loadingMarket } = useMarketData(rpcUrl)

  return (
    <div style={{ 
      padding: 'var(--cb-space-lg)',
      maxWidth: '480px',
      margin: '0 auto',
    }}>
      {/* Balance Section */}
      {!address ? (
        /* Not Connected */
        <div style={{ 
          textAlign: 'center', 
          paddingTop: 'var(--cb-space-2xl)',
          paddingBottom: 'var(--cb-space-xl)',
        }}>
          <div className="balance-large">$0.00</div>
          <div className="cb-caption" style={{ marginTop: 'var(--cb-space-sm)' }}>
            New to Medici Account?
          </div>
          <p className="cb-body-sm" style={{ 
            color: 'var(--cb-text-secondary)',
            marginTop: 'var(--cb-space-xs)',
            marginBottom: 'var(--cb-space-lg)',
          }}>
            Here's how to get started
          </p>
        </div>
      ) : (
        /* Connected - Show Balance */
        <div style={{ 
          textAlign: 'center', 
          paddingTop: 'var(--cb-space-xl)',
          paddingBottom: 'var(--cb-space-lg)',
        }}>
          <div className="balance-large">
            ${balance !== null ? (Number(balance) / 1e6).toFixed(2) : '0.00'}
          </div>
          <div className="cb-caption" style={{ marginTop: 'var(--cb-space-sm)' }}>
            Total Balance
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions" style={{ marginBottom: 'var(--cb-space-xl)' }}>
        <Link to="/buy" className="quick-action">
          <div className="quick-action-icon">💰</div>
          <div className="quick-action-label">Buy</div>
        </Link>
        
        <Link to="/pay" className="quick-action">
          <div className="quick-action-icon">📥</div>
          <div className="quick-action-label">Receive</div>
        </Link>
      </div>

      {/* Fund Account CTA (if not connected or low balance) */}
      {(!address || (balance !== null && Number(balance) < 100000000)) && (
        <div style={{ 
          background: 'rgba(0, 218, 255, 0.5)',
          borderRadius: '20px',
          padding: 'var(--cb-space-xl)',
          marginBottom: 'var(--cb-space-xl)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background Image with 20% opacity */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/medici-footer.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
            pointerEvents: 'none',
          }} />

          {/* Content (relative to sit above background) */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Decorative Icon Box */}
            <div style={{
              width: '72px',
              height: '72px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              marginBottom: 'var(--cb-space-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
            }}>
              💳
            </div>

            <h3 style={{ 
              fontSize: '20px',
              fontWeight: 600,
              marginBottom: 'var(--cb-space-xs)',
              color: 'white',
            }}>
              Fund your account
            </h3>
            <p style={{ 
              fontSize: '15px',
              marginBottom: 'var(--cb-space-lg)',
              color: 'rgba(255, 255, 255, 0.9)',
            }}>
              Add crypto or stablecoin
            </p>

            {!isConnected ? (
              <button 
                onClick={() => open()}
                style={{ 
                  background: 'white',
                  color: 'black',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Get Started
              </button>
            ) : (
              <Link to="/invest" style={{ 
                background: 'white',
                color: 'black',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'block',
                textAlign: 'center',
              }}>
                Fund my account
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Market Info Cards - Hidden when not connected to match Figma */}
      {address && stats && (
        <div>
          <h3 style={{ 
            fontSize: '17px',
            fontWeight: 600,
            marginBottom: 'var(--cb-space-md)',
            color: 'var(--cb-text-primary)',
          }}>
            Buy BTC or USDC and start earning
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Bitcoin Card */}
            <Link 
              to="/invest" 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--cb-space-md)',
                textDecoration: 'none',
                cursor: 'pointer',
                background: 'var(--cb-card-bg)',
                padding: '16px',
                borderRadius: '16px',
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#FF9500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}>
                ₿
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '17px', fontWeight: 600, color: 'white' }}>Bitcoin</div>
                <div style={{ fontSize: '15px', color: 'var(--cb-text-secondary)' }}>BTC</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '17px', fontWeight: 600, color: 'white' }}>$67,500</div>
                <div style={{ fontSize: '15px', color: 'var(--cb-green)' }}>+2.5%</div>
              </div>
            </Link>

            {/* USDC Card */}
            <Link 
              to="/invest" 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--cb-space-md)',
                textDecoration: 'none',
                cursor: 'pointer',
                background: 'var(--cb-card-bg)',
                padding: '16px',
                borderRadius: '16px',
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#0A84FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: 'white',
              }}>
                $
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '17px', fontWeight: 600, color: 'white' }}>USD Coin</div>
                <div style={{ fontSize: '15px', color: 'var(--cb-text-secondary)' }}>USDC</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '17px', fontWeight: 600, color: 'white' }}>
                  {loadingMarket ? '...' : `${stats.baseAPY}%`}
                </div>
                <div style={{ fontSize: '15px', color: 'var(--cb-text-secondary)' }}>APY</div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Empty State for Non-Connected */}
      {!address && (
        <div style={{ textAlign: 'center', marginTop: 'var(--cb-space-2xl)' }}>
          <p className="cb-body-sm" style={{ color: 'var(--cb-text-secondary)' }}>
            Connect your wallet to view your portfolio and start earning with Bitcoin and stablecoins.
          </p>
        </div>
      )}
    </div>
  )
}
