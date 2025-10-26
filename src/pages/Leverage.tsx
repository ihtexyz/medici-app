import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

import { getBranches } from "../config/cent"
import { useAllPrices } from "../hooks/useAllPrices"

/**
 * Leverage Page
 *
 * Educational tool for understanding leverage in CENT Protocol.
 * Simulates leveraged positions and shows risk/reward scenarios.
 */
export default function Leverage() {
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const { prices } = useAllPrices()

  const branches = getBranches()
  const [selectedCollateral, setSelectedCollateral] = useState<string>(branches[0]?.collSymbol || "WBTC18")
  const [initialCollateral, setInitialCollateral] = useState<string>("1.0")
  const [leverageMultiplier, setLeverageMultiplier] = useState<number>(2.0)
  const [interestRate, setInterestRate] = useState<string>("5")

  const collPrice = prices[selectedCollateral] ? parseFloat(prices[selectedCollateral]!) : 67500

  // Calculate leverage outcomes
  const leverageCalc = useMemo(() => {
    const initial = parseFloat(initialCollateral) || 0
    const leverage = leverageMultiplier

    // Total exposure = initial collateral * leverage multiplier
    const totalExposure = initial * leverage

    // Debt = total exposure - initial collateral
    const debtAmount = totalExposure - initial

    // Collateral value
    const collValue = totalExposure * collPrice

    // Debt value (in USD)
    const debtValue = debtAmount * collPrice

    // Collateral Ratio = (collateral value / debt value) * 100
    const collateralRatio = debtValue > 0 ? (collValue / debtValue) * 100 : 0

    // Liquidation price (at MCR = 120%)
    const liquidationPrice = debtValue > 0 ? (debtValue * 1.2) / totalExposure : 0

    // Annual interest cost
    const rate = parseFloat(interestRate) / 100
    const annualInterest = debtValue * rate

    return {
      initial,
      leverage,
      totalExposure,
      debtAmount,
      collValue,
      debtValue,
      collateralRatio,
      liquidationPrice,
      annualInterest,
    }
  }, [initialCollateral, leverageMultiplier, collPrice, interestRate])

  const isHealthy = leverageCalc.collateralRatio >= 150
  const isAtRisk = leverageCalc.collateralRatio < 150 && leverageCalc.collateralRatio >= 120
  const isCritical = leverageCalc.collateralRatio < 120

  // Price scenarios (±10%, ±20%, ±30%)
  const scenarios = useMemo(() => {
    return [
      { label: "+30%", change: 1.3, color: "#34C759" },
      { label: "+20%", change: 1.2, color: "#34C759" },
      { label: "+10%", change: 1.1, color: "#34C759" },
      { label: "Current", change: 1.0, color: "var(--cb-text-primary)" },
      { label: "-10%", change: 0.9, color: "#FF9500" },
      { label: "-20%", change: 0.8, color: "#FF453A" },
      { label: "-30%", change: 0.7, color: "#FF453A" },
    ].map(s => {
      const newPrice = collPrice * s.change
      const newCollValue = leverageCalc.totalExposure * newPrice
      const newCR = leverageCalc.debtValue > 0 ? (newCollValue / leverageCalc.debtValue) * 100 : 0
      const pnl = (newCollValue - leverageCalc.collValue) - leverageCalc.debtValue

      return {
        ...s,
        price: newPrice,
        collateralRatio: newCR,
        pnl,
        isLiquidated: newCR < 120,
      }
    })
  }, [collPrice, leverageCalc])

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
        <div style={{ fontSize: '64px', marginBottom: 'var(--cb-space-lg)' }}>📊</div>
        <h2 className="cb-title" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Leverage Calculator
        </h2>
        <p className="cb-body" style={{
          color: 'var(--cb-text-secondary)',
          marginBottom: 'var(--cb-space-xl)',
        }}>
          Connect your wallet to simulate leveraged positions
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
        <h1 className="cb-title">Leverage Calculator</h1>
        <p className="cb-caption" style={{ marginTop: 'var(--cb-space-xs)' }}>
          Simulate leveraged positions and understand risks
        </p>
      </div>

      {/* Important Warning */}
      <div className="cb-card" style={{
        padding: 'var(--cb-space-md)',
        marginBottom: 'var(--cb-space-lg)',
        background: 'rgba(255, 69, 58, 0.1)',
        border: '2px solid rgba(255, 69, 58, 0.3)',
      }}>
        <div className="cb-caption" style={{ color: '#FF453A' }}>
          ⚠️ <strong>High Risk:</strong> Leverage amplifies both gains AND losses. You can be
          liquidated if the collateral price drops. Only use leverage if you fully understand the risks.
        </div>
      </div>

      {/* Input Section */}
      <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginBottom: 'var(--cb-space-lg)' }}>
        <h3 className="cb-subtitle" style={{ marginBottom: 12 }}>Position Parameters</h3>

        {/* Collateral Selection */}
        <div style={{ marginBottom: 16 }}>
          <div className="cb-caption" style={{ marginBottom: 8 }}>Collateral Type</div>
          <select
            value={selectedCollateral}
            onChange={(e) => setSelectedCollateral(e.target.value)}
            className="cb-input"
            style={{ width: '100%' }}
          >
            {branches.map(b => (
              <option key={b.collSymbol} value={b.collSymbol}>{b.collSymbol}</option>
            ))}
          </select>
          {prices[selectedCollateral] && (
            <div className="cb-caption" style={{ marginTop: 4 }}>
              Current Price: ${prices[selectedCollateral]}
            </div>
          )}
        </div>

        {/* Initial Collateral */}
        <div style={{ marginBottom: 16 }}>
          <div className="cb-caption" style={{ marginBottom: 8 }}>Initial Collateral (BTC)</div>
          <input
            type="number"
            value={initialCollateral}
            onChange={(e) => setInitialCollateral(e.target.value)}
            placeholder="1.0"
            className="cb-input"
            style={{ width: '100%' }}
            step="0.01"
          />
        </div>

        {/* Leverage Multiplier */}
        <div style={{ marginBottom: 16 }}>
          <div className="cb-caption" style={{ marginBottom: 8 }}>
            Leverage Multiplier: {leverageMultiplier.toFixed(1)}x
          </div>
          <input
            type="range"
            min="1.5"
            max="5.0"
            step="0.1"
            value={leverageMultiplier}
            onChange={(e) => setLeverageMultiplier(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <div className="cb-caption">1.5x (Safe)</div>
            <div className="cb-caption">5.0x (Risky)</div>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="cb-caption" style={{ marginBottom: 8 }}>
            Interest Rate: {interestRate}% APR
          </div>
          <input
            type="range"
            min="0.5"
            max="25"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Position Summary */}
      <div className="cb-card" style={{
        padding: 'var(--cb-space-lg)',
        marginBottom: 'var(--cb-space-lg)',
        border: isCritical
          ? '2px solid var(--cb-error)'
          : isAtRisk
          ? '2px solid #FF9500'
          : '1px solid var(--cb-border)',
      }}>
        <h3 className="cb-subtitle" style={{ marginBottom: 12 }}>Position Summary</h3>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="cb-caption">Initial Collateral</div>
            <div className="cb-body cb-mono">{leverageCalc.initial.toFixed(4)} BTC</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="cb-caption">Total Exposure</div>
            <div className="cb-body cb-mono" style={{ fontWeight: 600 }}>
              {leverageCalc.totalExposure.toFixed(4)} BTC
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="cb-caption">Debt to Mint</div>
            <div className="cb-body cb-mono">${leverageCalc.debtValue.toFixed(2)} CENT</div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--cb-border)',
          paddingTop: 12,
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="cb-caption">Collateral Ratio</div>
            <div className="cb-body cb-mono" style={{
              fontWeight: 600,
              color: isCritical
                ? '#FF453A'
                : isAtRisk
                ? '#FF9500'
                : '#34C759',
            }}>
              {leverageCalc.collateralRatio.toFixed(0)}%
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="cb-caption">Liquidation Price</div>
            <div className="cb-body cb-mono">${leverageCalc.liquidationPrice.toFixed(2)}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="cb-caption">Annual Interest</div>
            <div className="cb-body cb-mono">${leverageCalc.annualInterest.toFixed(2)}</div>
          </div>
        </div>

        {isCritical && (
          <div style={{
            padding: 'var(--cb-space-sm)',
            background: 'rgba(255, 69, 58, 0.1)',
            borderRadius: '8px',
          }}>
            <div className="cb-caption" style={{ color: '#FF453A' }}>
              🚨 This position would be IMMEDIATELY LIQUIDATED. Reduce leverage or add more collateral.
            </div>
          </div>
        )}

        {isAtRisk && !isCritical && (
          <div style={{
            padding: 'var(--cb-space-sm)',
            background: 'rgba(255, 149, 0, 0.1)',
            borderRadius: '8px',
          }}>
            <div className="cb-caption" style={{ color: '#FF9500' }}>
              ⚠️ High risk of liquidation. Consider reducing leverage for safety.
            </div>
          </div>
        )}

        {isHealthy && leverageCalc.collateralRatio < 200 && (
          <div style={{
            padding: 'var(--cb-space-sm)',
            background: 'rgba(255, 149, 0, 0.05)',
            borderRadius: '8px',
          }}>
            <div className="cb-caption">
              ℹ️ Position is healthy but leverage is significant. Monitor closely.
            </div>
          </div>
        )}
      </div>

      {/* Price Scenarios */}
      <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginBottom: 'var(--cb-space-lg)' }}>
        <h3 className="cb-subtitle" style={{ marginBottom: 12 }}>Price Change Scenarios</h3>
        <p className="cb-caption" style={{ marginBottom: 16 }}>
          See how your position performs at different {selectedCollateral} prices
        </p>

        {scenarios.map((scenario) => (
          <div
            key={scenario.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              marginBottom: 8,
              background: scenario.isLiquidated
                ? 'rgba(255, 69, 58, 0.1)'
                : 'var(--cb-surface-secondary)',
              borderRadius: '8px',
              border: scenario.label === "Current" ? '2px solid var(--cb-primary)' : 'none',
            }}
          >
            <div style={{ flex: 1 }}>
              <div className="cb-caption" style={{ fontWeight: 600 }}>{scenario.label}</div>
              <div className="cb-caption" style={{ fontSize: '11px' }}>
                ${scenario.price.toFixed(0)}
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div className="cb-caption" style={{
                fontWeight: 600,
                color: scenario.isLiquidated ? '#FF453A' : scenario.color,
              }}>
                {scenario.isLiquidated ? 'LIQUIDATED' : `CR: ${scenario.collateralRatio.toFixed(0)}%`}
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div className="cb-caption" style={{
                fontWeight: 600,
                color: scenario.isLiquidated
                  ? '#FF453A'
                  : scenario.pnl >= 0
                  ? '#34C759'
                  : '#FF453A',
              }}>
                {scenario.isLiquidated
                  ? '—'
                  : `${scenario.pnl >= 0 ? '+' : ''}$${scenario.pnl.toFixed(0)}`}
              </div>
            </div>
          </div>
        ))}

        <div className="cb-caption" style={{ marginTop: 12, fontSize: '11px', color: 'var(--cb-text-secondary)' }}>
          PnL = Profit/Loss compared to holding without leverage
        </div>
      </div>

      {/* How It Works */}
      <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginBottom: 'var(--cb-space-lg)' }}>
        <h3 className="cb-subtitle" style={{ marginBottom: 12 }}>How Leverage Works</h3>

        <div style={{ marginBottom: 12 }}>
          <div className="cb-body" style={{ fontWeight: 600, marginBottom: 4 }}>
            1. Open Trove with Collateral
          </div>
          <div className="cb-caption">
            Deposit your initial BTC collateral into a Trove
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div className="cb-body" style={{ fontWeight: 600, marginBottom: 4 }}>
            2. Mint CENT Stablecoin
          </div>
          <div className="cb-caption">
            Borrow CENT against your collateral (up to safe CR)
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div className="cb-body" style={{ fontWeight: 600, marginBottom: 4 }}>
            3. Buy More BTC
          </div>
          <div className="cb-caption">
            Use borrowed CENT to buy more BTC on the market
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div className="cb-body" style={{ fontWeight: 600, marginBottom: 4 }}>
            4. Add to Position
          </div>
          <div className="cb-caption">
            Add the purchased BTC back to your Trove as collateral
          </div>
        </div>

        <div>
          <div className="cb-body" style={{ fontWeight: 600, marginBottom: 4 }}>
            5. Repeat (Optional)
          </div>
          <div className="cb-caption">
            Repeat steps 2-4 to increase leverage further
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Link to="/borrow" style={{ textDecoration: 'none' }}>
        <button
          className="cb-btn cb-btn-primary"
          disabled={isCritical}
          style={{ marginBottom: 'var(--cb-space-md)' }}
        >
          {isCritical ? 'Adjust Parameters First' : 'Open Leveraged Position →'}
        </button>
      </Link>

      <div className="cb-caption" style={{ textAlign: 'center' }}>
        This calculator is for educational purposes. Always do your own research.
      </div>
    </div>
  )
}
