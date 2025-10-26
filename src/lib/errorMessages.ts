/**
 * Enhanced Error Messages
 *
 * Converts technical blockchain/contract errors into user-friendly messages
 * with actionable suggestions
 */

export interface ErrorDetails {
  title: string
  message: string
  suggestion?: string
  actionLabel?: string
  action?: () => void
}

/**
 * Parse error and return user-friendly details
 */
export function parseError(error: unknown): ErrorDetails {
  // Default error
  let details: ErrorDetails = {
    title: 'Transaction Failed',
    message: 'An unexpected error occurred. Please try again.',
  }

  // Handle Error objects
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase()

    // User rejection
    if (
      errorMessage.includes('user rejected') ||
      errorMessage.includes('user denied') ||
      errorMessage.includes('user cancelled')
    ) {
      return {
        title: 'Transaction Cancelled',
        message: 'You cancelled the transaction in your wallet.',
      }
    }

    // Insufficient funds for gas
    if (
      errorMessage.includes('insufficient funds') ||
      errorMessage.includes('insufficient balance')
    ) {
      return {
        title: 'Insufficient Funds',
        message:
          "You don't have enough ETH to pay for gas fees. Add more ETH to your wallet.",
        suggestion: 'Get ETH from a faucet or bridge',
        actionLabel: 'Get ETH',
      }
    }

    // Collateral Ratio too low
    if (errorMessage.includes('cr too low') || errorMessage.includes('collateral ratio')) {
      return {
        title: 'Collateral Ratio Too Low',
        message:
          "This transaction would bring your collateral ratio below the minimum 120%. Add more collateral or reduce the amount you're borrowing.",
        suggestion: 'Keep CR above 150% for safety',
      }
    }

    // Minimum debt requirement
    if (errorMessage.includes('min debt') || errorMessage.includes('minimum debt')) {
      return {
        title: 'Minimum Debt Required',
        message:
          'You must borrow at least 2,000 CENT to open a Trove. Increase your borrow amount.',
        suggestion: 'Minimum: 2,000 CENT',
      }
    }

    // Maximum debt exceeded
    if (errorMessage.includes('max debt') || errorMessage.includes('maximum debt')) {
      return {
        title: 'Maximum Debt Exceeded',
        message:
          "You're trying to borrow more than your collateral allows. Reduce the amount or add more collateral.",
        suggestion: 'Check your borrowing power',
      }
    }

    // Allowance/approval issues
    if (errorMessage.includes('allowance') || errorMessage.includes('erc20: insufficient allowance')) {
      return {
        title: 'Approval Required',
        message:
          'You need to approve the contract to spend your tokens. Click the approval button first.',
        suggestion: 'Approve before transacting',
      }
    }

    // Slippage exceeded
    if (errorMessage.includes('slippage') || errorMessage.includes('price impact')) {
      return {
        title: 'Slippage Exceeded',
        message:
          'The price moved too much during your transaction. Increase slippage tolerance or try again.',
        suggestion: 'Try increasing max fee tolerance',
      }
    }

    // Network/RPC errors
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection')
    ) {
      return {
        title: 'Network Error',
        message: 'Failed to connect to the blockchain. Check your internet connection and try again.',
        suggestion: 'Verify network connection',
      }
    }

    // Trove already exists
    if (errorMessage.includes('trove exists') || errorMessage.includes('already open')) {
      return {
        title: 'Trove Already Exists',
        message:
          'You already have a Trove with this configuration. Use a different owner index or manage your existing Trove.',
        suggestion: 'Check your existing Troves',
      }
    }

    // Trove doesn't exist
    if (errorMessage.includes('trove not found') || errorMessage.includes('no trove')) {
      return {
        title: 'Trove Not Found',
        message:
          'No Trove found with this configuration. Open a new Trove or check your owner index.',
      }
    }

    // Insufficient collateral to withdraw
    if (errorMessage.includes('insufficient collateral')) {
      return {
        title: 'Insufficient Collateral',
        message:
          "You're trying to withdraw more collateral than available, or it would bring your CR too low.",
        suggestion: 'Check your collateral ratio',
      }
    }

    // Insufficient debt to repay
    if (
      errorMessage.includes('insufficient debt') ||
      errorMessage.includes('nothing to repay')
    ) {
      return {
        title: 'No Debt to Repay',
        message: "You don't have any outstanding debt to repay in this Trove.",
      }
    }

    // Wrong network
    if (
      errorMessage.includes('wrong network') ||
      errorMessage.includes('unsupported network') ||
      errorMessage.includes('chain id')
    ) {
      return {
        title: 'Wrong Network',
        message:
          "You're connected to the wrong network. Please switch to Base Sepolia in your wallet.",
        suggestion: 'Switch to Base Sepolia',
        actionLabel: 'Switch Network',
      }
    }

    // Transaction reverted (generic)
    if (errorMessage.includes('transaction reverted') || errorMessage.includes('execution reverted')) {
      return {
        title: 'Transaction Reverted',
        message:
          'The transaction failed to execute. This could be due to invalid parameters or contract restrictions.',
        suggestion: 'Double-check all values',
      }
    }

    // Gas estimation failed
    if (errorMessage.includes('gas') && errorMessage.includes('estimate')) {
      return {
        title: 'Transaction Would Fail',
        message:
          'The transaction would fail if submitted. Check that all parameters are correct.',
        suggestion: 'Review transaction details',
      }
    }

    // Nonce too low
    if (errorMessage.includes('nonce')) {
      return {
        title: 'Transaction Nonce Error',
        message:
          'Your wallet transaction counter is out of sync. Try resetting your wallet or waiting a moment.',
        suggestion: 'Reset wallet or wait',
      }
    }

    // Replacement transaction underpriced
    if (errorMessage.includes('replacement') && errorMessage.includes('underpriced')) {
      return {
        title: 'Transaction Underpriced',
        message:
          'To replace a pending transaction, you need to increase the gas price significantly.',
        suggestion: 'Increase gas price by at least 10%',
      }
    }

    // Wallet not connected
    if (errorMessage.includes('wallet') || errorMessage.includes('not connected')) {
      return {
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet to continue.',
        suggestion: 'Click "Connect Wallet" button',
      }
    }

    // Contract paused (if applicable)
    if (errorMessage.includes('paused')) {
      return {
        title: 'Contract Paused',
        message:
          'This contract is currently paused. Please try again later or check announcements.',
        suggestion: 'Check official channels for updates',
      }
    }

    // Price feed issues
    if (errorMessage.includes('oracle') || errorMessage.includes('price feed')) {
      return {
        title: 'Price Feed Error',
        message:
          'Unable to fetch current prices. This is usually temporary. Please try again in a moment.',
        suggestion: 'Wait and retry',
      }
    }

    // Redemption specific errors
    if (errorMessage.includes('redemption')) {
      return {
        title: 'Redemption Failed',
        message: 'Unable to complete redemption. Check that you have sufficient CENT balance.',
        suggestion: 'Verify your CENT balance',
      }
    }

    // Stability pool errors
    if (errorMessage.includes('stability pool') || errorMessage.includes('sp deposit')) {
      return {
        title: 'Stability Pool Error',
        message:
          'Unable to interact with Stability Pool. Verify you have sufficient balance.',
        suggestion: 'Check your CENT balance',
      }
    }

    // If no specific match, use the actual error message (truncated)
    return {
      title: 'Transaction Failed',
      message: error.message.slice(0, 200),
      suggestion: 'If this persists, contact support',
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      title: 'Error',
      message: error,
    }
  }

  // Return default for unknown errors
  return details
}

/**
 * Get user-friendly error message (short version)
 */
export function getErrorMessage(error: unknown): string {
  const details = parseError(error)
  return details.message
}

/**
 * Get error title
 */
export function getErrorTitle(error: unknown): string {
  const details = parseError(error)
  return details.title
}

/**
 * Check if error is user-actionable
 */
export function isUserActionable(error: unknown): boolean {
  const details = parseError(error)
  return !!details.action || !!details.suggestion
}

/**
 * Log error for debugging (can be connected to Sentry)
 */
export function logError(error: unknown, context?: Record<string, any>) {
  console.error('[Error]', error, context)

  // In production, send to Sentry or other error tracking
  if (import.meta.env.MODE === 'production') {
    // Import and use Sentry here if needed
    // captureException(error, { extra: context })
  }
}

/**
 * Format error for display with suggestion
 */
export function formatErrorMessage(error: unknown): string {
  const details = parseError(error)
  let message = details.message

  if (details.suggestion) {
    message += `\n\n💡 ${details.suggestion}`
  }

  return message
}
