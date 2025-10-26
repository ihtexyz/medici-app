import { useState } from "react"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

import { useBridgeCustomer } from "../hooks/useBridgeCustomer"
import { useBridgeAccount } from "../hooks/useBridgeAccount"
import { useBridgeCards } from "../hooks/useBridgeCards"
import { useTransactionHistory } from "../hooks/useTransactionHistory"
import TransactionHistory from "../components/TransactionHistory"
import {
  createVirtualAccount,
  createCard,
  freezeCard,
  unfreezeCard,
  onRamp,
  offRamp,
  crossBorderPayment,
} from "../services/bridge"
import useCentBalance from "../hooks/useCentBalance"
import type {
  CreateCardRequest,
  OnRampRequest,
  OffRampRequest,
  CrossBorderPaymentRequest,
} from "../types/bridge"

/**
 * Bank Page - Bridge.xyz Integration
 * Features:
 * - Virtual USD bank account
 * - Virtual payment cards
 * - On/off ramp CENT ↔ USD
 * - Banking services powered by Bridge
 */
export default function Bank() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { balance: centBalance } = useCentBalance()
  const { customerId, customer, loading: loadingCustomer, error: customerError } = useBridgeCustomer()
  const { primaryAccount, loading: loadingAccount, error: accountError } = useBridgeAccount()
  const { primaryCard, loading: loadingCards, error: cardsError } = useBridgeCards()
  const { transactions, addTransaction, confirmTransaction, failTransaction, getTransactionsByType } = useTransactionHistory(address)

  const [creatingAccount, setCreatingAccount] = useState(false)
  const [creatingCard, setCreatingCard] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [showAddMoney, setShowAddMoney] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [showBuyCent, setShowBuyCent] = useState(false)
  const [showCashOut, setShowCashOut] = useState(false)
  const [showSendMoney, setShowSendMoney] = useState(false)
  const [showGlobalPay, setShowGlobalPay] = useState(false)
  const [amount, setAmount] = useState("")
  const [processing, setProcessing] = useState(false)

  const handleCreateAccount = async () => {
    if (!address || !customerId) {
      setStatus("Customer not ready. Please try again.")
      return
    }

    setCreatingAccount(true)
    setStatus(null)
    try {
      // Create virtual account that links USD deposits to USDC on user's wallet
      const response = await createVirtualAccount(customerId, {
        source: {
          currency: "usd",
          rail: "ach", // ACH deposits
        },
        destination: {
          currency: "usdc", // Receive as USDC
          payment_rail: "base", // On Base network (or arbitrum for Arbitrum)
          address: address, // User's wallet address
        },
      })

      if (response.success) {
        setStatus("Virtual account created successfully!")
        // Reload page to show new account
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setStatus(response.error?.message || "Failed to create account")
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to create account")
    } finally {
      setCreatingAccount(false)
    }
  }

  const handleCreateCard = async () => {
    if (!address || !primaryAccount) return

    setCreatingCard(true)
    setStatus(null)
    try {
      const request: CreateCardRequest = {
        account_id: primaryAccount.id,
        card_type: "virtual",
        cardholder_name: `${primaryAccount.account_owner.first_name} ${primaryAccount.account_owner.last_name}`,
        spending_limits: {
          daily: 1000,
          monthly: 5000,
          per_transaction: 500,
        },
      }

      const response = await createCard(request)
      if (response.success) {
        setStatus("Card created successfully!")
        // Reload page to show new card
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setStatus(response.error?.message || "Failed to create card")
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to create card")
    } finally {
      setCreatingCard(false)
    }
  }

  const handleAddMoney = async () => {
    if (!amount || !primaryAccount) return

    setProcessing(true)
    setStatus(null)
    try {
      // In production, this would integrate with actual payment rails
      // For now, we'll show a placeholder for the on-ramp flow
      setStatus(`Add Money flow: Deposit $${amount} to account ${primaryAccount.account_number}`)
      setAmount("")
      setShowAddMoney(false)
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to add money")
    } finally {
      setProcessing(false)
    }
  }

  const handleWithdraw = async () => {
    if (!amount || !primaryAccount) return

    setProcessing(true)
    setStatus(null)
    try {
      // Validate sufficient balance
      const withdrawAmount = parseFloat(amount)
      if (withdrawAmount > primaryAccount.balance) {
        setStatus("Insufficient balance")
        setProcessing(false)
        return
      }

      setStatus(`Withdraw flow: Transfer $${amount} from account ${primaryAccount.account_number}`)
      setAmount("")
      setShowWithdraw(false)
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to withdraw")
    } finally {
      setProcessing(false)
    }
  }

  const handleBuyCent = async () => {
    if (!amount || !primaryAccount || !address) return

    setProcessing(true)
    setStatus(null)
    const txId = addTransaction("on_ramp", amount, "USD", `Buy CENT with $${amount}`)

    try {
      const request: OnRampRequest = {
        from_currency: "usd",
        to_currency: "usdc", // Bridge converts to stablecoin first
        from_amount: parseFloat(amount),
        destination_address: address,
        source_account_id: primaryAccount.id,
      }

      const response = await onRamp(request)
      if (response.success) {
        confirmTransaction(txId)
        setStatus(`On-ramp initiated: $${amount} USD → CENT`)
        setAmount("")
        setShowBuyCent(false)
      } else {
        failTransaction(txId, response.error?.message || "Failed to buy CENT")
        setStatus(response.error?.message || "Failed to buy CENT")
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Failed to buy CENT"
      failTransaction(txId, errorMsg)
      setStatus(errorMsg)
    } finally {
      setProcessing(false)
    }
  }

  const handleCashOut = async () => {
    if (!amount || !primaryAccount || !centBalance) return

    setProcessing(true)
    setStatus(null)

    // Validate sufficient CENT balance
    const cashOutAmount = parseFloat(amount)
    const centBalanceNum = Number(centBalance) / 1e6
    if (cashOutAmount > centBalanceNum) {
      setStatus("Insufficient CENT balance")
      setProcessing(false)
      return
    }

    const txId = addTransaction("off_ramp", amount, "CENT", `Cash out ${amount} CENT to USD`)

    try {
      const request: OffRampRequest = {
        from_currency: "usdc", // Convert CENT to USDC first
        to_currency: "usd",
        from_amount: cashOutAmount,
        destination_account_id: primaryAccount.id,
      }

      const response = await offRamp(request)
      if (response.success) {
        confirmTransaction(txId)
        setStatus(`Off-ramp initiated: ${amount} CENT → USD`)
        setAmount("")
        setShowCashOut(false)
      } else {
        failTransaction(txId, response.error?.message || "Failed to cash out")
        setStatus(response.error?.message || "Failed to cash out")
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Failed to cash out"
      failTransaction(txId, errorMsg)
      setStatus(errorMsg)
    } finally {
      setProcessing(false)
    }
  }

  const handleSendMoney = async () => {
    if (!amount || !primaryAccount) return

    setProcessing(true)
    setStatus(null)
    try {
      // This would open a form for entering recipient details
      setStatus(`Send Money: Transfer $${amount} via ACH/Wire`)
      setAmount("")
      setShowSendMoney(false)
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to send money")
    } finally {
      setProcessing(false)
    }
  }

  const handleGlobalPay = async () => {
    if (!amount || !primaryAccount) return

    setProcessing(true)
    setStatus(null)
    try {
      const request: CrossBorderPaymentRequest = {
        from_currency: "usd",
        to_currency: "eur", // Example: USD to EUR
        amount: parseFloat(amount),
        source_account_id: primaryAccount.id,
        recipient_details: {
          name: "Recipient Name",
          iban: "DE89370400440532013000",
          swift_code: "COBADEFF",
        },
      }

      const response = await crossBorderPayment(request)
      if (response.success) {
        setStatus(`Cross-border payment initiated: $${amount}`)
        setAmount("")
        setShowGlobalPay(false)
      } else {
        setStatus(response.error?.message || "Failed to send global payment")
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to send global payment")
    } finally {
      setProcessing(false)
    }
  }

  const handleFreezeCard = async () => {
    if (!primaryCard) return

    setProcessing(true)
    setStatus(null)
    try {
      const response = primaryCard.status === 'active'
        ? await freezeCard(primaryCard.id)
        : await unfreezeCard(primaryCard.id)

      if (response.success) {
        setStatus(`Card ${primaryCard.status === 'active' ? 'frozen' : 'unfrozen'} successfully!`)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setStatus(response.error?.message || "Failed to update card status")
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to update card status")
    } finally {
      setProcessing(false)
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
        <div style={{ fontSize: '64px', marginBottom: 'var(--cb-space-lg)' }}>🏦</div>
        <h2 className="cb-title" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Bitcoin Banking
        </h2>
        <p className="cb-body" style={{
          color: 'var(--cb-text-secondary)',
          marginBottom: 'var(--cb-space-xl)',
        }}>
          Connect your wallet to access banking features, virtual accounts, and cards
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

  // Loading customer
  if (loadingCustomer) {
    return (
      <div style={{
        padding: 'var(--cb-space-lg)',
        maxWidth: '480px',
        margin: '0 auto',
        textAlign: 'center',
        paddingTop: 'var(--cb-space-2xl)',
      }}>
        <div className="cb-body">Setting up your account...</div>
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
        <h1 className="cb-title">Banking</h1>
        <p className="cb-caption" style={{ marginTop: 'var(--cb-space-xs)' }}>
          Real bank account and card powered by Bitcoin
        </p>
      </div>

      {/* Balances Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--cb-space-md)',
        marginBottom: 'var(--cb-space-xl)',
      }}>
        <div className="cb-card" style={{ padding: 'var(--cb-space-md)' }}>
          <div className="cb-caption" style={{ marginBottom: 'var(--cb-space-xs)' }}>
            CENT Balance
          </div>
          <div className="cb-body" style={{ fontSize: '20px', fontWeight: 600 }}>
            ${centBalance ? (Number(centBalance) / 1e6).toFixed(2) : '0.00'}
          </div>
        </div>

        <div className="cb-card" style={{ padding: 'var(--cb-space-md)' }}>
          <div className="cb-caption" style={{ marginBottom: 'var(--cb-space-xs)' }}>
            USD Account
          </div>
          <div className="cb-body" style={{ fontSize: '20px', fontWeight: 600 }}>
            ${primaryAccount ? primaryAccount.balance.toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {/* Virtual Account Section */}
      {!primaryAccount && !loadingAccount ? (
        <div className="cb-card" style={{
          padding: 'var(--cb-space-xl)',
          marginBottom: 'var(--cb-space-lg)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 'var(--cb-space-sm)' }}>🏦</div>
          <h3 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-xs)' }}>
            Create Bank Account
          </h3>
          <p className="cb-caption" style={{ marginBottom: 'var(--cb-space-md)', color: 'var(--cb-text-secondary)' }}>
            Get a virtual USD account with routing and account numbers to receive payments
          </p>
          <button
            className="cb-btn cb-btn-primary"
            onClick={handleCreateAccount}
            disabled={creatingAccount}
            style={{ width: '100%' }}
          >
            {creatingAccount ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      ) : primaryAccount ? (
        <div className="cb-card" style={{
          padding: 'var(--cb-space-lg)',
          marginBottom: 'var(--cb-space-lg)',
        }}>
          <h3 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>
            Virtual Bank Account
          </h3>

          <div style={{ marginBottom: 'var(--cb-space-md)' }}>
            <div className="cb-caption" style={{ marginBottom: 'var(--cb-space-xs)' }}>
              Routing Number
            </div>
            <div className="cb-body cb-mono" style={{ fontSize: '16px' }}>
              {primaryAccount.routing_number}
            </div>
          </div>

          <div style={{ marginBottom: 'var(--cb-space-md)' }}>
            <div className="cb-caption" style={{ marginBottom: 'var(--cb-space-xs)' }}>
              Account Number
            </div>
            <div className="cb-body cb-mono" style={{ fontSize: '16px' }}>
              {primaryAccount.account_number}
            </div>
          </div>

          <div style={{ marginBottom: 'var(--cb-space-lg)' }}>
            <div className="cb-caption" style={{ marginBottom: 'var(--cb-space-xs)' }}>
              Balance
            </div>
            <div className="cb-body" style={{ fontSize: '24px', fontWeight: 600 }}>
              ${primaryAccount.balance.toFixed(2)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--cb-space-sm)' }}>
            <button
              className="cb-btn cb-btn-primary"
              style={{ flex: 1 }}
              onClick={() => setShowAddMoney(true)}
            >
              Add Money
            </button>
            <button
              className="cb-btn cb-btn-tertiary"
              style={{ flex: 1 }}
              onClick={() => setShowWithdraw(true)}
            >
              Withdraw
            </button>
          </div>
        </div>
      ) : null}

      {/* Virtual Card Section */}
      {primaryAccount && !primaryCard && !loadingCards ? (
        <div className="cb-card" style={{
          padding: 'var(--cb-space-xl)',
          marginBottom: 'var(--cb-space-lg)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 'var(--cb-space-sm)' }}>💳</div>
          <h3 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-xs)' }}>
            Get a Payment Card
          </h3>
          <p className="cb-caption" style={{ marginBottom: 'var(--cb-space-md)', color: 'var(--cb-text-secondary)' }}>
            Virtual debit card to spend your Bitcoin anywhere
          </p>
          <button
            className="cb-btn cb-btn-primary"
            onClick={handleCreateCard}
            disabled={creatingCard}
            style={{ width: '100%' }}
          >
            {creatingCard ? 'Creating Card...' : 'Create Card'}
          </button>
        </div>
      ) : primaryCard ? (
        <div className="cb-card" style={{
          padding: 'var(--cb-space-lg)',
          marginBottom: 'var(--cb-space-lg)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}>
          <div style={{ marginBottom: 'var(--cb-space-xl)' }}>
            <div style={{ fontSize: '12px', marginBottom: 'var(--cb-space-md)', opacity: 0.8 }}>
              VIRTUAL DEBIT CARD
            </div>
            <div style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '2px', marginBottom: 'var(--cb-space-md)' }}>
              {primaryCard.card_number}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--cb-space-sm)' }}>
            <div>
              <div style={{ fontSize: '10px', marginBottom: '4px', opacity: 0.8 }}>EXPIRES</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>
                {primaryCard.expiry_month}/{primaryCard.expiry_year}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', marginBottom: '4px', opacity: 0.8 }}>CVV</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>•••</div>
            </div>
          </div>

          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: 'var(--cb-space-md)' }}>
            {primaryCard.cardholder_name}
          </div>

          <div style={{ display: 'flex', gap: 'var(--cb-space-sm)', marginTop: 'var(--cb-space-lg)' }}>
            <button
              className="cb-btn cb-btn-tertiary"
              style={{ flex: 1 }}
              onClick={handleFreezeCard}
              disabled={processing}
            >
              {processing ? 'Processing...' : primaryCard.status === 'active' ? 'Freeze Card' : 'Unfreeze Card'}
            </button>
            <button
              className="cb-btn cb-btn-tertiary"
              style={{ flex: 1 }}
              onClick={() => setStatus('Set spending limits feature coming soon')}
            >
              Set Limits
            </button>
          </div>
        </div>
      ) : null}

      {/* Quick Actions */}
      <div style={{ marginBottom: 'var(--cb-space-lg)' }}>
        <h3 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Quick Actions
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cb-space-md)' }}>
          <button
            className="cb-card"
            onClick={() => setShowBuyCent(true)}
            style={{
              padding: 'var(--cb-space-md)',
              textAlign: 'center',
              border: 'none',
              cursor: 'pointer',
              background: 'var(--cb-card-bg)',
              borderRadius: 'var(--cb-radius-lg)',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: 'var(--cb-space-xs)' }}>⬇️</div>
            <div className="cb-body" style={{ fontWeight: 600, marginBottom: '2px' }}>Buy CENT</div>
            <div className="cb-caption">Fiat → Crypto</div>
          </button>

          <button
            className="cb-card"
            onClick={() => setShowCashOut(true)}
            style={{
              padding: 'var(--cb-space-md)',
              textAlign: 'center',
              border: 'none',
              cursor: 'pointer',
              background: 'var(--cb-card-bg)',
              borderRadius: 'var(--cb-radius-lg)',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: 'var(--cb-space-xs)' }}>⬆️</div>
            <div className="cb-body" style={{ fontWeight: 600, marginBottom: '2px' }}>Cash Out</div>
            <div className="cb-caption">Crypto → Fiat</div>
          </button>

          <button
            className="cb-card"
            onClick={() => setShowSendMoney(true)}
            style={{
              padding: 'var(--cb-space-md)',
              textAlign: 'center',
              border: 'none',
              cursor: 'pointer',
              background: 'var(--cb-card-bg)',
              borderRadius: 'var(--cb-radius-lg)',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: 'var(--cb-space-xs)' }}>💸</div>
            <div className="cb-body" style={{ fontWeight: 600, marginBottom: '2px' }}>Send Money</div>
            <div className="cb-caption">Bank Transfer</div>
          </button>

          <button
            className="cb-card"
            onClick={() => setShowGlobalPay(true)}
            style={{
              padding: 'var(--cb-space-md)',
              textAlign: 'center',
              border: 'none',
              cursor: 'pointer',
              background: 'var(--cb-card-bg)',
              borderRadius: 'var(--cb-radius-lg)',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: 'var(--cb-space-xs)' }}>🌍</div>
            <div className="cb-body" style={{ fontWeight: 600, marginBottom: '2px' }}>Global Pay</div>
            <div className="cb-caption">Cross-Border</div>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {status && (
        <div className="cb-card" style={{
          padding: 'var(--cb-space-md)',
          marginBottom: 'var(--cb-space-md)',
          background: status.includes('success') ? 'rgba(48, 209, 88, 0.1)' : 'rgba(255, 59, 48, 0.1)',
          border: `1px solid ${status.includes('success') ? 'var(--cb-green)' : 'var(--cb-red)'}`,
        }}>
          <div className="cb-caption" style={{ color: status.includes('success') ? 'var(--cb-green)' : 'var(--cb-red)' }}>
            {status}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {(customerError || accountError || cardsError) && (
        <div className="cb-card" style={{
          padding: 'var(--cb-space-md)',
          marginBottom: 'var(--cb-space-md)',
          background: 'rgba(255, 59, 48, 0.1)',
          border: '1px solid var(--cb-red)',
        }}>
          <div className="cb-caption" style={{ color: 'var(--cb-red)' }}>
            {customerError || accountError || cardsError}
          </div>
        </div>
      )}

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div style={{ marginBottom: 'var(--cb-space-lg)' }}>
          <h3 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>
            Recent Transactions
          </h3>
          <TransactionHistory
            transactions={getTransactionsByType("on_ramp").concat(
              getTransactionsByType("off_ramp"),
              getTransactionsByType("bank_deposit"),
              getTransactionsByType("bank_withdraw")
            ).slice(0, 5)}
            emptyMessage="No banking transactions yet"
          />
        </div>
      )}

      {/* Info Card */}
      <div className="cb-card" style={{
        padding: 'var(--cb-space-lg)',
        background: 'var(--cb-gray-1)',
      }}>
        <h3 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-xs)' }}>
          About Bridge Banking
        </h3>
        <p className="cb-caption" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Bridge powers your Bitcoin banking experience with:
        </p>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}>
          <li className="cb-caption" style={{ marginBottom: 'var(--cb-space-sm)' }}>
            • Real USD bank accounts with routing numbers
          </li>
          <li className="cb-caption" style={{ marginBottom: 'var(--cb-space-sm)' }}>
            • Debit cards for spending anywhere
          </li>
          <li className="cb-caption" style={{ marginBottom: 'var(--cb-space-sm)' }}>
            • Instant crypto ↔ fiat conversion
          </li>
          <li className="cb-caption">
            • International payments at low fees
          </li>
        </ul>
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="cb-card" style={{
            padding: 'var(--cb-space-xl)',
            maxWidth: '400px',
            width: '90%',
          }}>
            <h3 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>Add Money</h3>
            <p className="cb-caption" style={{ marginBottom: 'var(--cb-space-md)' }}>
              Deposit funds to your virtual account
            </p>
            <input
              type="number"
              placeholder="Amount in USD"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="cb-input"
              style={{
                width: '100%',
                padding: 'var(--cb-space-md)',
                marginBottom: 'var(--cb-space-md)',
                border: '1px solid var(--cb-border)',
                borderRadius: 'var(--cb-radius-md)',
                fontSize: '16px',
              }}
            />
            <div style={{ display: 'flex', gap: 'var(--cb-space-sm)' }}>
              <button
                className="cb-btn cb-btn-tertiary"
                onClick={() => { setShowAddMoney(false); setAmount("") }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="cb-btn cb-btn-primary"
                onClick={handleAddMoney}
                disabled={processing || !amount}
                style={{ flex: 1 }}
              >
                {processing ? 'Processing...' : 'Add Money'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="cb-card" style={{
            padding: 'var(--cb-space-xl)',
            maxWidth: '400px',
            width: '90%',
          }}>
            <h3 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>Withdraw</h3>
            <p className="cb-caption" style={{ marginBottom: 'var(--cb-space-md)' }}>
              Available: ${primaryAccount?.balance.toFixed(2) || '0.00'}
            </p>
            <input
              type="number"
              placeholder="Amount in USD"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="cb-input"
              style={{
                width: '100%',
                padding: 'var(--cb-space-md)',
                marginBottom: 'var(--cb-space-md)',
                border: '1px solid var(--cb-border)',
                borderRadius: 'var(--cb-radius-md)',
                fontSize: '16px',
              }}
            />
            <div style={{ display: 'flex', gap: 'var(--cb-space-sm)' }}>
              <button
                className="cb-btn cb-btn-tertiary"
                onClick={() => { setShowWithdraw(false); setAmount("") }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="cb-btn cb-btn-primary"
                onClick={handleWithdraw}
                disabled={processing || !amount}
                style={{ flex: 1 }}
              >
                {processing ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy CENT Modal */}
      {showBuyCent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="cb-card" style={{
            padding: 'var(--cb-space-xl)',
            maxWidth: '400px',
            width: '90%',
          }}>
            <h3 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>Buy CENT</h3>
            <p className="cb-caption" style={{ marginBottom: 'var(--cb-space-md)' }}>
              Convert USD from your account to CENT
            </p>
            <input
              type="number"
              placeholder="Amount in USD"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="cb-input"
              style={{
                width: '100%',
                padding: 'var(--cb-space-md)',
                marginBottom: 'var(--cb-space-md)',
                border: '1px solid var(--cb-border)',
                borderRadius: 'var(--cb-radius-md)',
                fontSize: '16px',
              }}
            />
            <div style={{ display: 'flex', gap: 'var(--cb-space-sm)' }}>
              <button
                className="cb-btn cb-btn-tertiary"
                onClick={() => { setShowBuyCent(false); setAmount("") }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="cb-btn cb-btn-primary"
                onClick={handleBuyCent}
                disabled={processing || !amount}
                style={{ flex: 1 }}
              >
                {processing ? 'Processing...' : 'Buy CENT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cash Out Modal */}
      {showCashOut && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="cb-card" style={{
            padding: 'var(--cb-space-xl)',
            maxWidth: '400px',
            width: '90%',
          }}>
            <h3 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>Cash Out</h3>
            <p className="cb-caption" style={{ marginBottom: 'var(--cb-space-md)' }}>
              Available: {centBalance ? (Number(centBalance) / 1e6).toFixed(2) : '0.00'} CENT
            </p>
            <input
              type="number"
              placeholder="Amount in CENT"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="cb-input"
              style={{
                width: '100%',
                padding: 'var(--cb-space-md)',
                marginBottom: 'var(--cb-space-md)',
                border: '1px solid var(--cb-border)',
                borderRadius: 'var(--cb-radius-md)',
                fontSize: '16px',
              }}
            />
            <div style={{ display: 'flex', gap: 'var(--cb-space-sm)' }}>
              <button
                className="cb-btn cb-btn-tertiary"
                onClick={() => { setShowCashOut(false); setAmount("") }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="cb-btn cb-btn-primary"
                onClick={handleCashOut}
                disabled={processing || !amount}
                style={{ flex: 1 }}
              >
                {processing ? 'Processing...' : 'Cash Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Money Modal */}
      {showSendMoney && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="cb-card" style={{
            padding: 'var(--cb-space-xl)',
            maxWidth: '400px',
            width: '90%',
          }}>
            <h3 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>Send Money</h3>
            <p className="cb-caption" style={{ marginBottom: 'var(--cb-space-md)' }}>
              Send via ACH or Wire transfer
            </p>
            <input
              type="number"
              placeholder="Amount in USD"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="cb-input"
              style={{
                width: '100%',
                padding: 'var(--cb-space-md)',
                marginBottom: 'var(--cb-space-md)',
                border: '1px solid var(--cb-border)',
                borderRadius: 'var(--cb-radius-md)',
                fontSize: '16px',
              }}
            />
            <div style={{ display: 'flex', gap: 'var(--cb-space-sm)' }}>
              <button
                className="cb-btn cb-btn-tertiary"
                onClick={() => { setShowSendMoney(false); setAmount("") }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="cb-btn cb-btn-primary"
                onClick={handleSendMoney}
                disabled={processing || !amount}
                style={{ flex: 1 }}
              >
                {processing ? 'Processing...' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Pay Modal */}
      {showGlobalPay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="cb-card" style={{
            padding: 'var(--cb-space-xl)',
            maxWidth: '400px',
            width: '90%',
          }}>
            <h3 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>Global Payment</h3>
            <p className="cb-caption" style={{ marginBottom: 'var(--cb-space-md)' }}>
              Send money internationally at low fees
            </p>
            <input
              type="number"
              placeholder="Amount in USD"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="cb-input"
              style={{
                width: '100%',
                padding: 'var(--cb-space-md)',
                marginBottom: 'var(--cb-space-md)',
                border: '1px solid var(--cb-border)',
                borderRadius: 'var(--cb-radius-md)',
                fontSize: '16px',
              }}
            />
            <div style={{ display: 'flex', gap: 'var(--cb-space-sm)' }}>
              <button
                className="cb-btn cb-btn-tertiary"
                onClick={() => { setShowGlobalPay(false); setAmount("") }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="cb-btn cb-btn-primary"
                onClick={handleGlobalPay}
                disabled={processing || !amount}
                style={{ flex: 1 }}
              >
                {processing ? 'Processing...' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
