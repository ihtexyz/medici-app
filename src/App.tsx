import { BrowserRouter, Route, Routes } from "react-router-dom"
import { lazy, Suspense } from "react"
import { WagmiProvider, QueryClientProvider, queryClient, wagmiConfig } from "./config/reown"

import Layout from "./components/Layout"
const Overview = lazy(() => import("./pages/Overview"))
const Borrow = lazy(() => import("./pages/Borrow"))
const Earn = lazy(() => import("./pages/Earn"))
const Rewards = lazy(() => import("./pages/Rewards"))
const Settings = lazy(() => import("./pages/Settings"))
const Portfolio = lazy(() => import("./pages/Portfolio"))
const Swap = lazy(() => import("./pages/Swap"))
const Bank = lazy(() => import("./pages/Bank"))
import { SwapKitProvider } from "./state/swapkit"
import { ContactsProvider } from "./context/ContactsContext"
import { ToastProvider } from "./context/ToastContext"
import ErrorBoundary from "./components/ErrorBoundary"

/**
 * App - Main application component
 * 
 * Authentication powered by Reown AppKit:
 * - Single sign-in for entire app
 * - Supports wallet connections, email & social login
 * - Multi-chain support (EVM, Solana, Bitcoin)
 * - No multiple wallet connection buttons
 * 
 * Features:
 * - Route-level code splitting with React.lazy
 * - Global error boundary
 * - Toast notifications
 * - Contacts management
 * - SwapKit for cross-chain swaps
 */
function App() {
  return (
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <SwapKitProvider>
              <ContactsProvider>
                <BrowserRouter>
                  <Layout>
                    <Suspense fallback={
                      <div style={{ 
                        padding: 16, 
                        textAlign: 'center',
                        color: 'var(--cb-text-secondary)',
                      }}>
                        Loading…
                      </div>
                    }>
                      <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/borrow" element={<Borrow />} />
                        <Route path="/earn" element={<Earn />} />
                        <Route path="/rewards" element={<Rewards />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/portfolio" element={<Portfolio />} />
                        <Route path="/swap" element={<Swap />} />
                        <Route path="/bank" element={<Bank />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                </BrowserRouter>
              </ContactsProvider>
            </SwapKitProvider>
          </ToastProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  )
}

export default App
