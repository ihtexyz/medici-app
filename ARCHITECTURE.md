# Medici App - Architecture Overview

## System Architecture

Medici is a comprehensive Bitcoin banking application that combines multiple protocols and services to create a seamless user experience.

```
┌─────────────────────────────────────────────────────────────┐
│                      Medici Frontend                         │
│                   (React + TypeScript)                       │
└───────────────┬─────────────────────────────────────────────┘
                │
    ┌───────────┼───────────┬────────────┬───────────────────┐
    │           │           │            │                   │
    ▼           ▼           ▼            ▼                   ▼
┌────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐    ┌──────────────┐
│ Reown  │ │  CENT   │ │ SwapKit  │ │ Bridge   │    │  Blockchain  │
│ AppKit │ │Protocol │ │   API    │ │   API    │    │   (Wagmi)    │
└────────┘ └─────────┘ └──────────┘ └──────────┘    └──────────────┘
    │           │            │            │                   │
    │           │            │            │                   │
    ▼           ▼            ▼            ▼                   ▼
┌────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐    ┌──────────────┐
│Wallet/ │ │Arbitrum │ │Cross-    │ │ Banking  │    │Arbitrum      │
│Email/  │ │ Sepolia │ │Chain     │ │Infrastructure│ │Sepolia RPC   │
│Social  │ │Contracts│ │Swaps     │ │(Accounts,│    │              │
│Login   │ │         │ │          │ │ Cards)   │    │              │
└────────┘ └─────────┘ └──────────┘ └──────────┘    └──────────────┘
```

## Core Components

### 1. Authentication Layer (Reown AppKit)

**Purpose**: Single sign-on for entire app

**Features**:
- Wallet connections (MetaMask, WalletConnect, etc.)
- Email & social login
- Multi-chain support (EVM, Solana, Bitcoin)
- Session management

**Files**:
- `src/config/reown.ts` - AppKit configuration
- Supports Arbitrum Sepolia and Ethereum Sepolia networks

### 2. CENT Protocol Layer

**Purpose**: Bitcoin-backed stablecoin borrowing and lending

**Architecture**:
```
CollateralRegistry
├── WBTC Branch
│   ├── BorrowerOperations (borrow, repay, adjust)
│   ├── TroveManager (liquidations, redemptions)
│   ├── StabilityPool (deposits, yields)
│   └── PriceFeed (oracle)
└── cbBTC Branch
    ├── BorrowerOperations
    ├── TroveManager
    ├── StabilityPool
    └── PriceFeed
```

**Key Contracts**:
- `BorrowerOperations` - User interface for trove management
- `TroveManager` - Handles liquidations and redemptions
- `StabilityPool` - Accepts CENT deposits, pays yield
- `BOLDToken` - The CENT stablecoin (renamed from BOLD)

**Files**:
- `src/config/cent.ts` - Contract addresses and configuration
- `src/hooks/useTrove.ts` - Trove data fetching
- `src/hooks/useStabilityPool.ts` - Stability pool interactions
- `src/hooks/usePrice.ts` - Price oracle data
- `src/pages/Borrow.tsx` - Borrowing interface
- `src/pages/Earn.tsx` - Stability pool interface

**See**: [CENT_PROTOCOL.md](./CENT_PROTOCOL.md) for detailed protocol documentation

### 3. Bridge Banking Layer

**Purpose**: Real banking services powered by Bitcoin

**Architecture**:
```
Customer (KYC entity)
├── Virtual Accounts (USD ↔ USDC)
├── Payment Cards (spend anywhere)
├── External Accounts (withdrawals)
└── Transactions (deposits, transfers)
```

**API Structure**:
- Base URL: `https://api.bridge.xyz/v0`
- Authentication: `Api-Key` header
- Idempotency: `Idempotency-Key` for mutations

**Features**:
- Virtual USD bank accounts with routing numbers
- Virtual debit cards for spending
- On-ramp: USD → USDC → CENT
- Off-ramp: CENT → USDC → USD
- Cross-border payments

**Files**:
- `src/services/bridge.ts` - Bridge API client
- `src/hooks/useBridgeCustomer.ts` - Customer management
- `src/hooks/useBridgeAccount.ts` - Virtual account data
- `src/hooks/useBridgeCards.ts` - Card management
- `src/pages/Bank.tsx` - Banking interface

**See**: [BRIDGE_SETUP.md](./BRIDGE_SETUP.md) for detailed setup guide

### 4. SwapKit Integration

**Purpose**: Cross-chain token swaps

**Chains Supported**:
- Bitcoin (BTC)
- Ethereum (ETH, ERC20)
- Arbitrum (ARB, tokens)
- Solana (SOL, SPL)
- And more...

**Files**:
- `src/state/swapkit.ts` - SwapKit provider
- `src/pages/Swap.tsx` - Swap interface

### 5. State Management

**Pattern**: React Context + React Query

**Global State**:
- `SwapKitProvider` - Cross-chain swap state
- `ContactsProvider` - User contacts management
- `ToastProvider` - Notification system

**Local State**:
- Custom hooks for blockchain data (useTrove, useStabilityPool)
- React Query for API data caching
- localStorage for persistence

**Files**:
- `src/state/swapkit.ts`
- `src/context/ContactsContext.tsx`
- `src/context/ToastContext.tsx`

## Data Flow

### Borrowing Flow

```
1. User connects wallet (Reown)
   ↓
2. Select collateral (WBTC/cbBTC)
   ↓
3. App fetches:
   - Current price (PriceFeed)
   - Existing trove data (TroveManager)
   - Branch parameters (CollateralRegistry)
   ↓
4. User inputs:
   - Collateral amount
   - Borrow amount
   - Interest rate
   ↓
5. App calculates:
   - Collateral ratio
   - Liquidation price
   - Upfront fee
   - Hints for sorted list
   ↓
6. Transaction sent to BorrowerOperations
   ↓
7. Trove NFT minted
   ↓
8. CENT minted to user
```

### Stability Pool Flow

```
1. User has CENT balance
   ↓
2. Select pool (WBTC or cbBTC)
   ↓
3. App fetches:
   - Current deposit (if any)
   - Claimable gains (collateral + yield)
   - Pool stats
   ↓
4. User approves CENT (ERC20)
   ↓
5. Deposit to StabilityPool
   ↓
6. Continuous earning:
   - Interest from borrowers
   - Liquidation gains
   ↓
7. User claims or compounds gains
```

### Banking Flow

```
1. Wallet connects
   ↓
2. App creates Bridge customer automatically
   - Cached in localStorage
   ↓
3. User creates virtual account:
   - Source: USD (ACH deposits)
   - Destination: USDC → User wallet
   ↓
4. User receives:
   - Routing number
   - Account number
   ↓
5. USD deposits auto-convert:
   USD → USDC → User wallet
   ↓
6. User can:
   - Create virtual card
   - On-ramp (USD → CENT)
   - Off-ramp (CENT → USD)
   - Cross-border payments
```

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: CSS Design System (Coinbase-inspired)
- **Routing**: React Router v6

### Blockchain
- **Connection**: Wagmi v2 + Viem
- **Authentication**: Reown AppKit
- **Network**: Arbitrum Sepolia (testnet)
- **RPC**: Alchemy/Infura endpoints

### State Management
- **Global**: React Context API
- **Server**: React Query (TanStack Query)
- **Local**: React hooks (useState, useEffect)
- **Cache**: localStorage

### APIs & Services
- **CENT Protocol**: Direct contract calls via ethers.js
- **Bridge.xyz**: REST API with fetch
- **SwapKit**: SDK integration
- **Price Oracles**: Chainlink (via PriceFeed contracts)

## File Structure

```
medici-app-final/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx       # App shell with navigation
│   │   ├── MobileNav.tsx    # Bottom navigation
│   │   └── ErrorBoundary.tsx
│   │
│   ├── pages/               # Route components
│   │   ├── Overview.tsx     # Dashboard with positions
│   │   ├── Borrow.tsx       # Trove management
│   │   ├── Earn.tsx         # Stability pools
│   │   ├── Rewards.tsx      # CENT token claims
│   │   ├── Bank.tsx         # Bridge banking
│   │   ├── Swap.tsx         # Cross-chain swaps
│   │   ├── Portfolio.tsx    # Asset overview
│   │   └── Settings.tsx     # User preferences
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useTrove.ts      # Fetch trove data
│   │   ├── useStabilityPool.ts
│   │   ├── usePrice.ts
│   │   ├── useCentBalance.ts
│   │   ├── useBridgeCustomer.ts
│   │   ├── useBridgeAccount.ts
│   │   └── useBridgeCards.ts
│   │
│   ├── services/            # API clients
│   │   ├── bridge.ts        # Bridge.xyz API
│   │   └── cent.ts          # CENT protocol helpers
│   │
│   ├── config/              # Configuration
│   │   ├── reown.ts         # AppKit setup
│   │   └── cent.ts          # Protocol addresses
│   │
│   ├── state/               # Global state
│   │   └── swapkit.ts       # SwapKit provider
│   │
│   ├── context/             # React contexts
│   │   ├── ContactsContext.tsx
│   │   └── ToastContext.tsx
│   │
│   ├── types/               # TypeScript types
│   │   └── bridge.ts        # Bridge API types
│   │
│   ├── lib/                 # Utilities
│   │   └── runtime-env.ts   # Environment variables
│   │
│   └── App.tsx              # Root component with routes
│
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md      # This file
│   ├── CENT_PROTOCOL.md     # Protocol guide
│   ├── BRIDGE_SETUP.md      # Banking setup
│   └── IMPROVEMENTS.md      # Change history
│
├── env.template             # Environment variables template
└── README.md                # Project overview
```

## Environment Configuration

### Required Variables

```bash
# Network
VITE_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
VITE_CHAIN_ID=421614

# Authentication
VITE_REOWN_PROJECT_ID=your_project_id

# CENT Protocol
VITE_CENT_ADDRESSES_JSON={...contract addresses...}

# Bridge Banking
VITE_BRIDGE_API_KEY=your_api_key
VITE_BRIDGE_BASE_URL=https://api.bridge.xyz/v0
VITE_BRIDGE_ENVIRONMENT=sandbox

# SwapKit
VITE_SWAPKIT_API_KEY=your_api_key
VITE_SWAPKIT_PROJECT_ID=your_project_id
```

See [env.template](./env.template) for complete configuration.

## Security Considerations

### Smart Contract Interactions
- All transactions require user approval
- Contract addresses validated before interactions
- Slippage protection on swaps
- Collateral ratio checks before borrowing

### API Security
- API keys stored in environment variables
- Never committed to git
- Sandboxed for testing
- Rate limiting on Bridge API

### User Data
- No personal data stored on-chain
- Bridge KYC handled server-side
- localStorage used only for customer ID caching
- No sensitive data in client storage

## Performance Optimizations

### Code Splitting
- Route-based lazy loading
- Suspense boundaries for loading states
- Dynamic imports for heavy components

### Data Fetching
- React Query for caching
- Parallel requests where possible
- Optimistic UI updates
- Stale-while-revalidate pattern

### Bundle Size
- Tree-shaking enabled
- Minimal dependencies
- CSS in single file
- No heavy UI libraries

## Testing Strategy

### Manual Testing
1. Wallet connection flow
2. Trove opening with various parameters
3. Stability pool deposits/withdrawals
4. Bridge account/card creation
5. Cross-chain swaps
6. Mobile responsiveness

### Integration Points to Test
- Contract interactions (read/write)
- Bridge API calls
- SwapKit swaps
- Price oracle updates
- Transaction confirmations

## Deployment

### Build Process
```bash
npm run build
# Outputs to dist/
```

### Environment-Specific Builds
- **Development**: Sandbox APIs, testnet
- **Production**: Production APIs, mainnet

### Hosting
- **Frontend**: Netlify (current)
- **Alternative**: Vercel, Cloudflare Pages
- **CDN**: Automatic via hosting platform

## Monitoring & Analytics

### Key Metrics
- Wallet connection rate
- Trove creation success rate
- Transaction failure reasons
- Bridge API response times
- User retention

### Error Tracking
- ErrorBoundary component catches errors
- Toast notifications for user feedback
- Console logging in development

## Future Enhancements

### Protocol Features
- Batch delegation integration
- Advanced interest rate strategies
- Multi-trove management UI
- Redemption protection tools

### Banking Features
- Transaction history
- Webhook integration for real-time updates
- Recurring payments
- Bill pay functionality
- KYC flow improvements

### User Experience
- PWA support for mobile
- Push notifications
- Dark/light mode toggle
- Multi-language support
- Advanced charts and analytics

## Resources

- **CENT Protocol**: [CENT_PROTOCOL.md](./CENT_PROTOCOL.md)
- **Bridge Banking**: [BRIDGE_SETUP.md](./BRIDGE_SETUP.md)
- **Liquity v2 Docs**: https://github.com/liquity/bold
- **Bridge API Docs**: https://apidocs.bridge.xyz
- **Reown AppKit**: https://docs.reown.com/appkit
- **SwapKit**: https://docs.swapkit.dev

---

**Questions or Issues?**
See the main [README.md](./README.md) or check individual protocol documentation.
