/**
 * ErrorMessage Component
 *
 * Displays user-friendly error messages with suggestions and actions
 */

import { parseError, type ErrorDetails } from '../lib/errorMessages'
import './ErrorMessage.css'

interface ErrorMessageProps {
  error: unknown
  onDismiss?: () => void
  showDismiss?: boolean
}

export function ErrorMessage({ error, onDismiss, showDismiss = true }: ErrorMessageProps) {
  const details: ErrorDetails = parseError(error)

  return (
    <div className="error-message">
      <div className="error-message-header">
        <div className="error-message-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.1" />
            <path
              d="M10 6v4m0 4h.01M20 10a10 10 0 11-20 0 10 10 0 0120 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="error-message-title">{details.title}</div>
        {showDismiss && onDismiss && (
          <button
            className="error-message-close"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="error-message-body">{details.message}</div>

      {details.suggestion && (
        <div className="error-message-suggestion">
          <span className="error-message-suggestion-icon">💡</span>
          <span>{details.suggestion}</span>
        </div>
      )}

      {details.action && details.actionLabel && (
        <div className="error-message-action">
          <button onClick={details.action} className="error-message-action-button">
            {details.actionLabel}
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Inline error message - smaller, for form fields
 */
export function InlineError({ error }: { error: unknown }) {
  const details = parseError(error)

  return (
    <div className="inline-error">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 6v2m0 2h.01M15 8A7 7 0 111 8a7 7 0 0114 0z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span>{details.message}</span>
    </div>
  )
}

/**
 * Error alert - prominent, for critical errors
 */
export function ErrorAlert({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const details = parseError(error)

  return (
    <div className="error-alert">
      <div className="error-alert-content">
        <div className="error-alert-icon">⚠️</div>
        <div>
          <div className="error-alert-title">{details.title}</div>
          <div className="error-alert-message">{details.message}</div>
          {details.suggestion && (
            <div className="error-alert-suggestion">💡 {details.suggestion}</div>
          )}
        </div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="error-alert-retry">
          Try Again
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
