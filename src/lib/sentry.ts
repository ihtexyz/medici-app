/**
 * Sentry Error Tracking Configuration
 *
 * Initialize Sentry for error monitoring and performance tracking.
 * Requires VITE_SENTRY_DSN environment variable.
 */

import * as Sentry from '@sentry/react'

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN

  // Only initialize if DSN is provided
  if (!dsn) {
    console.log('Sentry DSN not configured - error tracking disabled')
    return
  }

  Sentry.init({
    dsn,

    // Environment
    environment: import.meta.env.MODE, // 'development' | 'production'

    // Release tracking
    release: `medici@${import.meta.env.VITE_APP_VERSION || '0.1.0'}`,

    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Capture 10% of sessions for replay
        sessionSampleRate: 0.1,
        // Capture 100% of sessions with errors
        errorSampleRate: 1.0,
      }),
    ],

    // Performance traces sample rate (10% of transactions)
    tracesSampleRate: 0.1,

    // Capture unhandled promise rejections
    captureUnhandledRejections: true,

    // Don't send errors in development
    enabled: import.meta.env.MODE === 'production',

    // Filter out certain errors
    beforeSend(event, hint) {
      // Don't send errors from browser extensions
      if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
        frame => frame.filename?.includes('extension://')
      )) {
        return null
      }

      // Don't send network errors from failed RPC calls (too noisy)
      if (event.message?.includes('RPC')) {
        return null
      }

      return event
    },

    // Add custom tags
    initialScope: {
      tags: {
        network: 'base-sepolia', // Update based on actual network
      },
    },
  })

  // Set user context when wallet connects
  // Call this from your wallet connection handler
  // Example: setUserContext('0x123...')
}

/**
 * Set user context for error tracking
 */
export function setUserContext(address: string | undefined) {
  if (address) {
    Sentry.setUser({
      id: address,
      // Don't include any PII
    })
  } else {
    Sentry.setUser(null)
  }
}

/**
 * Set transaction context
 */
export function setTransactionContext(
  txHash: string,
  type: string,
  network: string
) {
  Sentry.setContext('transaction', {
    hash: txHash,
    type,
    network,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Capture custom event
 */
export function captureEvent(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  extra?: Record<string, any>
) {
  Sentry.captureMessage(message, {
    level,
    extra,
  })
}

/**
 * Capture exception with context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  })
}

/**
 * Start performance transaction
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  })
}
