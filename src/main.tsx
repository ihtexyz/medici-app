import React from "react"
import ReactDOM from "react-dom/client"

// Import the application component
import App from "./App"

// Import global styles
import "./index.css"

// Import OnchainKit styles
import '@coinbase/onchainkit/styles.css'

// Import error boundary
import ErrorBoundary from "./components/ErrorBoundary"
import { initMonitoring } from "./lib/monitoring"

// Root rendering entry point
// Note: WagmiProvider and QueryClientProvider are now in App.tsx via Reown config
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

// Initialize lightweight monitoring after app bootstrap
try {
  initMonitoring()
} catch {}