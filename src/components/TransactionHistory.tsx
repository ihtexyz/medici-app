import type { TransactionHistoryProps, Transaction } from "../types/transaction"

/**
 * TransactionHistory Component
 * Displays a list of transactions with status, type, and details
 */

const getTransactionIcon = (type: Transaction["type"]): string => {
  switch (type) {
    case "borrow":
      return "💳"
    case "repay":
      return "💰"
    case "deposit":
      return "📥"
    case "withdraw":
      return "📤"
    case "claim":
      return "🎁"
    case "swap":
      return "🔄"
    case "bank_account":
      return "🏦"
    case "bank_card":
      return "💳"
    case "bank_deposit":
      return "⬇️"
    case "bank_withdraw":
      return "⬆️"
    case "on_ramp":
      return "⬇️"
    case "off_ramp":
      return "⬆️"
    case "send":
      return "💸"
    case "receive":
      return "📨"
    default:
      return "📋"
  }
}

const getStatusColor = (status: Transaction["status"]): string => {
  switch (status) {
    case "confirmed":
      return "var(--cb-green)"
    case "pending":
      return "var(--cb-orange)"
    case "failed":
      return "var(--cb-red)"
    default:
      return "var(--cb-text-secondary)"
  }
}

const getStatusText = (status: Transaction["status"]): string => {
  switch (status) {
    case "confirmed":
      return "Confirmed"
    case "pending":
      return "Pending"
    case "failed":
      return "Failed"
    default:
      return "Unknown"
  }
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

export default function TransactionHistory({
  transactions,
  loading = false,
  emptyMessage = "No transactions yet",
  onTransactionClick,
}: TransactionHistoryProps) {
  if (loading) {
    return (
      <div className="cb-card" style={{
        padding: 'var(--cb-space-lg)',
        textAlign: 'center',
      }}>
        <div className="cb-body" style={{ color: 'var(--cb-text-secondary)' }}>
          Loading transactions...
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="cb-card" style={{
        padding: 'var(--cb-space-xl)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: 'var(--cb-space-md)' }}>
          📋
        </div>
        <div className="cb-body" style={{
          color: 'var(--cb-text-secondary)',
          marginBottom: 'var(--cb-space-sm)',
        }}>
          {emptyMessage}
        </div>
        <div className="cb-caption">
          Your transactions will appear here
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-sm)' }}>
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="cb-card"
          onClick={() => onTransactionClick?.(tx)}
          style={{
            padding: 'var(--cb-space-md)',
            cursor: onTransactionClick ? 'pointer' : 'default',
            transition: 'transform 0.2s ease',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--cb-space-md)',
          }}>
            {/* Icon */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--cb-gray-1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>
              {getTransactionIcon(tx.type)}
            </div>

            {/* Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2px',
              }}>
                <div className="cb-body" style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tx.description}
                </div>
                <div className="cb-body" style={{ fontWeight: 600, marginLeft: '8px' }}>
                  {tx.amount} {tx.token}
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div className="cb-caption">
                  {formatDate(tx.timestamp)}
                </div>
                <div className="cb-caption" style={{ color: getStatusColor(tx.status) }}>
                  {getStatusText(tx.status)}
                </div>
              </div>

              {/* Error message if failed */}
              {tx.status === "failed" && tx.error && (
                <div className="cb-caption" style={{
                  color: 'var(--cb-red)',
                  marginTop: '4px',
                  fontSize: '12px',
                }}>
                  {tx.error}
                </div>
              )}

              {/* Transaction hash if available */}
              {tx.hash && (
                <div className="cb-caption" style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
