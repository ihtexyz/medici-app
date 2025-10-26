import { NavLink } from "react-router-dom"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

import useCentBalance from "../hooks/useCentBalance"

/**
 * Layout - Coinbase-style mobile-first design
 * 
 * Authentication: Single Reown AppKit button
 * - Opens modal for wallet connection, email, or social login
 * - User signs in once, authenticated across entire app
 * - No multiple wallet buttons
 * 
 * Features:
 * - Pure black background
 * - Simple top header with balance
 * - Bottom tab navigation (5 tabs)
 * - Fullscreen content area
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { balance } = useCentBalance()

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--cb-black)',
      paddingBottom: '80px', // Space for bottom nav
    }}>
      {/* Minimal Top Header */}
      <header style={{
        padding: 'var(--cb-space-md) var(--cb-space-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--cb-black)',
        borderBottom: '1px solid var(--cb-gray-1)',
      }}>
        {/* Left: Logo */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--cb-space-sm)',
        }}>
          <img 
            src="/MEDICI.png" 
            alt="Medici" 
            style={{ 
              height: '28px',
              width: 'auto',
            }} 
          />
        </div>

        {/* Right: Balance or Connect Button */}
        {isConnected && address ? (
          <button
            onClick={() => open()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            {balance !== null && (
              <div style={{
                fontSize: '17px',
                fontWeight: 600,
                color: 'var(--cb-text-primary)',
              }}>
                ${(Number(balance) / 1e6).toFixed(2)}
              </div>
            )}
            <div className="cb-caption" style={{
              fontFamily: 'monospace',
              fontSize: '12px',
            }}>
              {address.slice(0, 6)}…{address.slice(-4)}
            </div>
          </button>
        ) : (
          <button
            onClick={() => open()}
            className="cb-btn cb-btn-primary"
            style={{
              padding: 'var(--cb-space-xs) var(--cb-space-md)',
              fontSize: '14px',
              width: 'auto',
            }}
          >
            Connect
          </button>
        )}
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        width: '100%', 
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {children}
      </main>

      {/* Bottom Tab Navigation (USDaf Style) */}
      <nav className="bottom-nav">
        <NavLink
          to="/"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">🏠</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/borrow"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">💳</span>
          <span>Borrow</span>
        </NavLink>

        <NavLink
          to="/earn"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">📈</span>
          <span>Earn</span>
        </NavLink>

        <NavLink
          to="/rewards"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">🎁</span>
          <span>Rewards</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">⚙️</span>
          <span>More</span>
        </NavLink>
      </nav>
    </div>
  )
}
