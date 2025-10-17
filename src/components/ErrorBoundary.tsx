import React from "react"

type Props = { children: React.ReactNode }
type State = { 
  error: Error | null
  errorInfo: React.ErrorInfo | null
  showDetails: boolean
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null, errorInfo: null, showDetails: false }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ errorInfo: info })
    
    try {
      const url = (window as any).ORIGAMI_MONITOR_URL as string | undefined
      if (url) {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "client_error",
            message: error.message,
            stack: error.stack,
            componentStack: info.componentStack,
            timestamp: Date.now(),
            url: window.location.href,
          }),
        }).catch(() => {})
      }
    } catch {}
  }

  handleRetry = () => {
    this.setState({ error: null, errorInfo: null, showDetails: false })
  }

  handleCopyError = () => {
    const { error, errorInfo } = this.state
    const errorText = `Error: ${error?.message}\n\nStack:\n${error?.stack}\n\nComponent Stack:\n${errorInfo?.componentStack}`
    navigator.clipboard.writeText(errorText).then(() => {
      alert('Error details copied to clipboard')
    })
  }

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }))
  }

  override render() {
    const { error, errorInfo, showDetails } = this.state
    
    if (error) {
      // Categorize error types for better user messaging
      const isNetworkError = error.message.includes('network') || error.message.includes('fetch')
      const isContractError = error.message.includes('contract') || error.message.includes('revert')
      const isWalletError = error.message.includes('wallet') || error.message.includes('provider')

      return (
        <div style={{ 
          padding: '32px 16px',
          maxWidth: 600,
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div className="hero-lede" style={{ color: '#ff6b6b' }}>
            {isNetworkError && '🌐 Network Issue'}
            {isContractError && '⚠️ Contract Error'}
            {isWalletError && '👛 Wallet Error'}
            {!isNetworkError && !isContractError && !isWalletError && '❌ Something went wrong'}
          </div>
          
          <h1 className="hero-title" style={{ marginTop: 16 }}>
            {isNetworkError && 'Unable to connect'}
            {isContractError && 'Transaction failed'}
            {isWalletError && 'Wallet issue detected'}
            {!isNetworkError && !isContractError && !isWalletError && 'We hit a snag'}
          </h1>
          
          <p className="hero-sub" style={{ maxWidth: 560, margin: '16px auto' }}>
            {isNetworkError && 'Please check your internet connection and try again.'}
            {isContractError && 'The transaction was rejected by the blockchain. Please check your inputs and try again.'}
            {isWalletError && 'Please reconnect your wallet and try again.'}
            {!isNetworkError && !isContractError && !isWalletError && 
              'An unexpected error occurred. Our team has been notified. Please try again.'}
          </p>

          <div style={{ 
            display: 'flex', 
            gap: 12, 
            justifyContent: 'center',
            marginTop: 24,
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={this.handleRetry}
              style={{
                padding: '12px 24px',
                background: '#FF8A00',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Try Again
            </button>
            
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: '#333',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              Refresh Page
            </button>

            <button 
              onClick={this.handleCopyError}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#888',
                border: '1px solid #333',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              Copy Error Details
            </button>
          </div>

          {/* Technical details toggle */}
          <div style={{ marginTop: 32 }}>
            <button 
              onClick={this.toggleDetails}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: 14,
                textDecoration: 'underline',
              }}
            >
              {showDetails ? 'Hide' : 'Show'} technical details
            </button>

            {showDetails && (
              <div style={{
                marginTop: 16,
                padding: 16,
                background: '#1a1a1a',
                borderRadius: 8,
                textAlign: 'left',
                fontSize: 12,
                fontFamily: 'monospace',
                overflowX: 'auto',
                maxHeight: 300,
                overflowY: 'auto',
              }}>
                <div style={{ color: '#ff6b6b', marginBottom: 8 }}>
                  <strong>Error:</strong> {error.message}
                </div>
                {error.stack && (
                  <div style={{ color: '#888', marginBottom: 8 }}>
                    <strong>Stack:</strong>
                    <pre style={{ margin: '4px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo?.componentStack && (
                  <div style={{ color: '#888' }}>
                    <strong>Component Stack:</strong>
                    <pre style={{ margin: '4px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }
    
    return this.props.children
  }
}


