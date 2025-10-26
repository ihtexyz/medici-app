# Monitoring & Analytics Setup Guide

This guide explains how to set up error tracking and analytics for the Medici application.

---

## Table of Contents

1. [Sentry Error Tracking](#sentry-error-tracking)
2. [Analytics Setup](#analytics-setup)
3. [Performance Monitoring](#performance-monitoring)
4. [Custom Events](#custom-events)
5. [Alerting](#alerting)

---

## Sentry Error Tracking

### Setup

**1. Create Sentry Account**
- Go to [sentry.io](https://sentry.io)
- Create free account or sign in
- Create new project (React)
- Copy DSN (Data Source Name)

**2. Add DSN to Environment**

Add to `.env`:
```bash
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_APP_VERSION=0.1.0
```

**3. Initialize in App**

The Sentry configuration is already created in `src/lib/sentry.ts`.

Update `src/App.tsx`:
```typescript
import { useEffect } from 'react'
import { initSentry, setUserContext } from './lib/sentry'
import { useAppKitAccount } from '@reown/appkit/react'

function App() {
  // Initialize Sentry on app load
  useEffect(() => {
    initSentry()
  }, [])

  // Set user context when wallet connects
  const { address } = useAppKitAccount()
  useEffect(() => {
    setUserContext(address)
  }, [address])

  // ... rest of app
}
```

### Usage Examples

**Capture Errors**:
```typescript
import { captureException } from './lib/sentry'

try {
  await openTrove(/*...*/)
} catch (error) {
  captureException(error, {
    context: 'openTrove',
    collateral: 'WBTC18',
    amount: '1.0',
  })
  throw error
}
```

**Track Transactions**:
```typescript
import { setTransactionContext, captureEvent } from './lib/sentry'

// Before transaction
const tx = await bo.openTrove(/*...*/)

// Track transaction
setTransactionContext(tx.hash, 'openTrove', 'base-sepolia')

// After confirmation
const receipt = await tx.wait()
captureEvent('Transaction confirmed', 'info', {
  txHash: tx.hash,
  gasUsed: receipt.gasUsed.toString(),
})
```

**Performance Tracking**:
```typescript
import { startTransaction } from './lib/sentry'

const transaction = startTransaction('openTrove', 'user.action')

try {
  // Perform operation
  await openTrove(/*...*/)
  transaction.setStatus('ok')
} catch (error) {
  transaction.setStatus('internal_error')
  throw error
} finally {
  transaction.finish()
}
```

### Configuration

**Error Filtering** (in `src/lib/sentry.ts`):
```typescript
beforeSend(event, hint) {
  // Don't send browser extension errors
  if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
    frame => frame.filename?.includes('extension://')
  )) {
    return null
  }

  // Filter RPC errors (too noisy)
  if (event.message?.includes('RPC')) {
    return null
  }

  return event
}
```

**Custom Tags**:
```typescript
Sentry.setTag('network', chainId)
Sentry.setTag('feature', 'borrow')
Sentry.setTag('wallet', walletType)
```

---

## Analytics Setup

### Option 1: Mixpanel

**1. Create Account**
- Go to [mixpanel.com](https://mixpanel.com)
- Create project
- Copy Project Token

**2. Install SDK**
```bash
npm install mixpanel-browser
```

**3. Create Analytics Helper**

Create `src/lib/analytics.ts`:
```typescript
import mixpanel from 'mixpanel-browser'

export function initAnalytics() {
  const token = import.meta.env.VITE_MIXPANEL_TOKEN
  if (!token) return

  mixpanel.init(token, {
    debug: import.meta.env.MODE === 'development',
    track_pageview: true,
    persistence: 'localStorage',
  })
}

export function track(event: string, properties?: Record<string, any>) {
  if (import.meta.env.MODE !== 'production') {
    console.log('Analytics:', event, properties)
    return
  }
  mixpanel.track(event, properties)
}

export function identifyUser(address: string) {
  mixpanel.identify(address)
  mixpanel.people.set({
    $last_login: new Date(),
    network: 'base-sepolia',
  })
}

export function trackPageView(path: string) {
  track('Page View', { path })
}

export function trackTransaction(type: string, details: Record<string, any>) {
  track('Transaction', {
    type,
    ...details,
    timestamp: Date.now(),
  })
}
```

**4. Add to App**

```typescript
import { initAnalytics, identifyUser, track } from './lib/analytics'

// In App.tsx
useEffect(() => {
  initAnalytics()
}, [])

// Track wallet connection
useEffect(() => {
  if (address) {
    identifyUser(address)
    track('Wallet Connected', { address })
  }
}, [address])

// Track page views
useEffect(() => {
  trackPageView(location.pathname)
}, [location.pathname])
```

**5. Environment Variable**

Add to `.env`:
```bash
VITE_MIXPANEL_TOKEN=your_token_here
```

### Option 2: Google Analytics 4

**1. Create GA4 Property**
- Go to [analytics.google.com](https://analytics.google.com)
- Create GA4 property
- Copy Measurement ID (G-XXXXXXXXXX)

**2. Install SDK**
```bash
npm install react-ga4
```

**3. Initialize**

Create `src/lib/ga.ts`:
```typescript
import ReactGA from 'react-ga4'

export function initGA() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
  if (!measurementId) return

  ReactGA.initialize(measurementId, {
    gaOptions: {
      debug_mode: import.meta.env.MODE === 'development',
    },
  })
}

export function trackPageView(path: string) {
  ReactGA.send({ hitType: 'pageview', page: path })
}

export function trackEvent(category: string, action: string, label?: string) {
  ReactGA.event({
    category,
    action,
    label,
  })
}
```

**4. Environment Variable**

Add to `.env`:
```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Option 3: PostHog (Open Source)

**1. Create Account**
- Go to [posthog.com](https://posthog.com) or self-host
- Create project
- Copy API key

**2. Install SDK**
```bash
npm install posthog-js
```

**3. Initialize**

```typescript
import posthog from 'posthog-js'

export function initPostHog() {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY
  if (!apiKey) return

  posthog.init(apiKey, {
    api_host: 'https://app.posthog.com',
    autocapture: true,
    capture_pageview: true,
  })
}

export function trackEvent(event: string, properties?: Record<string, any>) {
  posthog.capture(event, properties)
}
```

---

## Performance Monitoring

### Web Vitals Tracking

Already included in E2E tests, but you can also track in production:

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  track('Web Vitals', {
    name: metric.name,
    value: metric.value,
    id: metric.id,
  })
}

// Measure Core Web Vitals
getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

### Network Performance

Track RPC call performance:

```typescript
export async function trackRPCCall<T>(
  name: string,
  call: () => Promise<T>
): Promise<T> {
  const start = performance.now()

  try {
    const result = await call()
    const duration = performance.now() - start

    track('RPC Call', {
      name,
      duration,
      success: true,
    })

    return result
  } catch (error) {
    const duration = performance.now() - start

    track('RPC Call', {
      name,
      duration,
      success: false,
      error: error.message,
    })

    throw error
  }
}

// Usage
const balance = await trackRPCCall('getBalance', () =>
  provider.getBalance(address)
)
```

---

## Custom Events

### Key Events to Track

**User Actions**:
```typescript
// Wallet
track('Wallet Connected', { address, network })
track('Wallet Disconnected', { address })
track('Network Changed', { from, to })

// Borrow
track('Trove Opened', { collateral, amount, cr, interestRate })
track('Collateral Added', { amount, newCR })
track('Debt Repaid', { amount, remainingDebt })
track('Trove Closed', { collateral, debt })

// Earn
track('SP Deposit', { amount, poolSize, share })
track('SP Withdraw', { amount, remainingDeposit })
track('Rewards Claimed', { amount, type })

// Redeem
track('Redemption Started', { amount, fee })
track('Redemption Completed', { amount, collateralReceived })

// Leverage
track('Leverage Calculator Used', { multiplier, collateral })
```

**Technical Events**:
```typescript
// Performance
track('Page Load', { path, duration })
track('Slow RPC Call', { method, duration })

// Errors
track('Transaction Failed', { type, error, hash })
track('RPC Error', { method, error })

// Features
track('Feature Used', { feature: 'leverage_calculator' })
track('Help Viewed', { section: 'user_guide' })
```

---

## Alerting

### Sentry Alerts

**1. Configure in Sentry Dashboard**
- Go to Alerts → Create Alert Rule
- Set conditions (e.g., > 10 errors in 1 hour)
- Choose notification method (email, Slack, PagerDuty)

**Recommended Alerts**:
- Transaction failure rate > 10% in 1 hour
- Error rate > 50 events in 1 hour
- New error types
- Performance degradation (p95 > 5s)

### Custom Alerting

**Create Alert Helper**:

```typescript
export async function checkHealthAndAlert() {
  const errors = await getRecentErrors() // From your DB/Sentry API

  if (errors.length > 50) {
    await sendSlackAlert({
      channel: '#alerts',
      message: `⚠️ High error rate: ${errors.length} errors in last hour`,
      errors: errors.slice(0, 5), // Top 5
    })
  }
}

// Run every 5 minutes
setInterval(checkHealthAndAlert, 5 * 60 * 1000)
```

---

## Environment Variables

Complete `.env.template`:

```bash
# RPC Endpoints
VITE_RPC_URL=https://sepolia.base.org
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org
VITE_ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
VITE_ETH_SEPOLIA_RPC=https://ethereum-sepolia.publicnode.com

# Monitoring
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_APP_VERSION=0.1.0

# Analytics (choose one or more)
VITE_MIXPANEL_TOKEN=your_token
# OR
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
# OR
VITE_POSTHOG_KEY=your_key

# Reown (WalletConnect)
VITE_REOWN_PROJECT_ID=your_project_id

# OnchainKit
VITE_ONCHAINKIT_API_KEY=your_api_key

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true
```

---

## Dashboard Setup

### Sentry Dashboard

**Key Metrics to Monitor**:
1. Error rate trends
2. Top errors by frequency
3. Affected users count
4. Performance metrics (LCP, FCP)
5. Transaction traces

**Custom Dashboards**:
- Create widget for "Transaction Errors"
- Create widget for "RPC Call Performance"
- Create widget for "User Flow Errors"

### Analytics Dashboard

**Key Metrics**:
1. Daily Active Users (DAU)
2. Transaction volume
3. TVL (Total Value Locked)
4. Feature adoption rates
5. User retention

**Funnels to Track**:
- Wallet Connect → Open Trove → Success
- Visit Earn → Deposit → Success
- Calculate Leverage → Open Trove

---

## Testing

### Test Sentry

```typescript
import { captureException } from './lib/sentry'

// Throw test error
captureException(new Error('Test error from Medici'))
```

Check Sentry dashboard for the error.

### Test Analytics

```typescript
import { track } from './lib/analytics'

// Send test event
track('Test Event', {
  source: 'manual_test',
  timestamp: Date.now(),
})
```

Check analytics dashboard for the event.

---

## Best Practices

### Privacy

**DO**:
- ✅ Hash wallet addresses before sending
- ✅ Remove transaction amounts from errors
- ✅ Aggregate data before analysis
- ✅ Comply with GDPR/privacy laws
- ✅ Provide opt-out option

**DON'T**:
- ❌ Send private keys (never!)
- ❌ Send seed phrases
- ❌ Send transaction contents
- ❌ Send PII without consent

### Performance

**DO**:
- ✅ Batch events when possible
- ✅ Sample high-frequency events (10%)
- ✅ Use async tracking
- ✅ Cache analytics calls

**DON'T**:
- ❌ Block UI for analytics
- ❌ Send every RPC call
- ❌ Track sensitive operations

### Debugging

**Enable Debug Mode**:

```typescript
// In development
if (import.meta.env.MODE === 'development') {
  console.log('Sentry:', event, context)
  console.log('Analytics:', eventName, properties)
}
```

**Test in Production Mode**:

```bash
# Build and test production build locally
npm run build
npm run preview

# Check browser console for errors
# Verify events in dashboards
```

---

## Maintenance

### Weekly

- [ ] Review error trends
- [ ] Check alert noise
- [ ] Verify tracking works
- [ ] Update tags/contexts

### Monthly

- [ ] Analyze usage patterns
- [ ] Optimize sample rates
- [ ] Review privacy compliance
- [ ] Update dashboards

### Quarterly

- [ ] Review costs
- [ ] Audit tracked events
- [ ] Update documentation
- [ ] Security review

---

## Resources

- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Mixpanel Docs](https://docs.mixpanel.com/)
- [GA4 Docs](https://developers.google.com/analytics/devguides/collection/ga4)
- [PostHog Docs](https://posthog.com/docs)
- [Web Vitals](https://web.dev/vitals/)

---

**Status**: ✅ Ready to implement
**Last Updated**: 2025-10-26
**Priority**: High (production requirement)
