/**
 * Toast Notification Helpers
 *
 * Wrapper around react-hot-toast with consistent styling and behavior
 */

import toast from 'react-hot-toast'

/**
 * Toast duration constants (in milliseconds)
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000,
  TRANSACTION: 8000,
} as const

/**
 * Success toast - green theme, checkmark icon
 */
export function showSuccess(message: string, duration = TOAST_DURATION.MEDIUM) {
  return toast.success(message, {
    duration,
    style: {
      background: '#10b981',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10b981',
    },
  })
}

/**
 * Error toast - red theme, X icon
 */
export function showError(message: string, duration = TOAST_DURATION.LONG) {
  return toast.error(message, {
    duration,
    style: {
      background: '#ef4444',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#ef4444',
    },
  })
}

/**
 * Info toast - blue theme, info icon
 */
export function showInfo(message: string, duration = TOAST_DURATION.MEDIUM) {
  return toast(message, {
    duration,
    icon: 'ℹ️',
    style: {
      background: '#3b82f6',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
  })
}

/**
 * Warning toast - yellow/orange theme, warning icon
 */
export function showWarning(message: string, duration = TOAST_DURATION.LONG) {
  return toast(message, {
    duration,
    icon: '⚠️',
    style: {
      background: '#f59e0b',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
  })
}

/**
 * Loading toast - shows spinner, manually dismiss
 */
export function showLoading(message: string) {
  return toast.loading(message, {
    style: {
      background: '#6b7280',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
  })
}

/**
 * Transaction pending toast
 */
export function showTransactionPending(txHash?: string) {
  const message = txHash
    ? `Transaction pending: ${txHash.slice(0, 10)}...`
    : 'Transaction pending...'

  return showLoading(message)
}

/**
 * Transaction success toast
 */
export function showTransactionSuccess(message = 'Transaction confirmed', txHash?: string) {
  const fullMessage = txHash
    ? `${message}\nTx: ${txHash.slice(0, 10)}...`
    : message

  return showSuccess(fullMessage, TOAST_DURATION.TRANSACTION)
}

/**
 * Transaction error toast
 */
export function showTransactionError(error: unknown, customMessage?: string) {
  let message = customMessage || 'Transaction failed'

  // Extract user-friendly error message
  if (error instanceof Error) {
    if (error.message.includes('user rejected')) {
      message = 'Transaction rejected by user'
    } else if (error.message.includes('insufficient funds')) {
      message = 'Insufficient funds for gas'
    } else if (error.message.includes('CR too low')) {
      message = 'Collateral ratio too low'
    } else if (error.message.toLowerCase().includes('slippage')) {
      message = 'Slippage exceeded - try again'
    } else {
      message = error.message.slice(0, 100) // Limit error length
    }
  }

  return showError(message, TOAST_DURATION.LONG)
}

/**
 * Approval success toast
 */
export function showApprovalSuccess(token: string) {
  return showSuccess(`${token} approved successfully`)
}

/**
 * Approval pending toast
 */
export function showApprovalPending(token: string) {
  return showLoading(`Approving ${token}...`)
}

/**
 * Network switch toast
 */
export function showNetworkSwitch(networkName: string) {
  return showInfo(`Switched to ${networkName}`)
}

/**
 * Wallet connection toast
 */
export function showWalletConnected(address: string) {
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
  return showSuccess(`Wallet connected: ${shortAddress}`)
}

/**
 * Wallet disconnection toast
 */
export function showWalletDisconnected() {
  return showInfo('Wallet disconnected')
}

/**
 * Copy to clipboard toast
 */
export function showCopied(label = 'Copied to clipboard') {
  return showSuccess(label, TOAST_DURATION.SHORT)
}

/**
 * Generic promise toast - shows loading, then success/error
 */
export function showPromiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string
    error?: string
  }
) {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error || 'Operation failed',
    },
    {
      style: {
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      success: {
        duration: TOAST_DURATION.MEDIUM,
        style: {
          background: '#10b981',
          color: '#fff',
        },
      },
      error: {
        duration: TOAST_DURATION.LONG,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      },
    }
  )
}

/**
 * Dismiss specific toast
 */
export function dismissToast(toastId: string) {
  toast.dismiss(toastId)
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts() {
  toast.dismiss()
}

/**
 * Update existing toast
 */
export function updateToast(
  toastId: string,
  type: 'success' | 'error' | 'loading',
  message: string
) {
  if (type === 'success') {
    toast.success(message, { id: toastId })
  } else if (type === 'error') {
    toast.error(message, { id: toastId })
  } else {
    toast.loading(message, { id: toastId })
  }
}
