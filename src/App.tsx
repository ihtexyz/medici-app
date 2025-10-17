import { BrowserRouter, Route, Routes } from "react-router-dom"
import { lazy, Suspense } from "react"
import { WagmiProvider, QueryClientProvider, queryClient, wagmiConfig } from "./config/reown"

import Layout from "./components/Layout"
const Borrow = lazy(() => import("./pages/Borrow"))
const Buy = lazy(() => import("./pages/Buy"))
const Explore = lazy(() => import("./pages/Explore"))
const Invest = lazy(() => import("./pages/Invest"))
const Market = lazy(() => import("./pages/Market"))
const Overview = lazy(() => import("./pages/Overview"))
const Pay = lazy(() => import("./pages/Pay"))
const Portfolio = lazy(() => import("./pages/Portfolio"))
const Rewards = lazy(() => import("./pages/Rewards"))
const Swap = lazy(() => import("./pages/Swap"))
const Contacts = lazy(() => import("./pages/Contacts"))
const Settings = lazy(() => import("./pages/Settings"))
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
                        <Route path="/portfolio" element={<Portfolio />} />
                        <Route path="/buy" element={<Buy />} />
                        <Route path="/borrow" element={<Borrow />} />
                        <Route path="/invest" element={<Invest />} />
                        <Route path="/market" element={<Market />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/rewards" element={<Rewards />} />
                        <Route path="/swap" element={<Swap />} />
                        <Route path="/pay" element={<Pay />} />
                        <Route path="/contacts" element={<Contacts />} />
                        <Route path="/settings" element={<Settings />} />
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
