# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Medici** is a Bitcoin banking app built by Venice Fi that enables users to borrow against Bitcoin collateral, earn yield on stablecoins, and swap across chains. It's a React 18 + TypeScript + Vite application with a Coinbase-inspired design system.

**Live App**: https://cozy-yeot-1f174d.netlify.app
**Network**: Arbitrum Sepolia (testnet, chain ID 421614)

## Development Commands

```bash
# Development
npm install                    # Install dependencies (or pnpm install)
npm run dev                   # Start dev server on http://localhost:5173
npm run build                 # Build for production (runs tsc + vite build)
npm run preview               # Preview production build

# Linting & Formatting
npm run lint                  # Run ESLint with thesis-co config
npm run lint:eslint:fix       # Auto-fix ESLint issues
npm run format                # Check ESLint + Prettier
npm run format:fix            # Auto-fix all linting/formatting

# Testing
npm test                      # Run Jest tests in jsdom environment
```

## Architecture

### Authentication & Wallet Integration

**Single authentication system**: The app uses **Reown AppKit** (configured in `src/config/reown.ts`) as the sole authentication provider. This replaces multiple wallet connection buttons throughout the app.

- Supports: Wallet connections, email login, social login (Google, GitHub, Apple)
- Multi-chain: EVM (Arbitrum), Bitcoin, Solana support
- Providers are exported from `src/config/reown.ts` and imported into `App.tsx`
- **Do NOT add additional wallet connection buttons** - AppKit handles all authentication

### State Management

The app uses multiple React Context providers, nested in this order (see `src/App.tsx:44-90`):

1. **WagmiProvider** - Wagmi blockchain state
2. **QueryClientProvider** - React Query for data fetching
3. **ToastProvider** - Global toast notifications (`src/context/ToastContext.tsx`)
4. **SwapKitProvider** - Cross-chain swap state (`src/state/swapkit.tsx`)
5. **ContactsProvider** - User contacts management (`src/context/ContactsContext.tsx`)

### Protocol Integration

**Venice Fi Core** - P2P lending protocol on Arbitrum Sepolia:
- Contract addresses in `src/config/contracts.ts`
- Market data fetching in `src/lib/venice.ts`
- Uses ethers v6 for contract interaction

**CENT (Bold Protocol)** - Liquidity protocol for BTC-backed stablecoin:
- Configuration in `src/config/cent.ts` (addresses loaded from `VITE_CENT_ADDRESSES_JSON` env var)
- Services in `src/services/cent.ts` for opening troves, managing collateral
- ABIs imported from `bold-main/frontend/app/src/abi/`
- Supports multiple collateral types: WBTC18, cbBTC18

**SwapKit** - Cross-chain swaps (Bitcoin, Ethereum, Solana, Zcash):
- Quote generation and execution in `src/services/swapkit.ts`
- Falls back to mock quotes/swaps when API credentials not configured
- Real API integration requires `VITE_SWAPKIT_API_KEY` and `VITE_SWAPKIT_PROJECT_ID`

### Page Structure & Routing

React Router v6 with lazy-loaded routes (code splitting):
- `/` - Overview (home dashboard)
- `/buy` - Coinbase Pay on/off ramp
- `/borrow` - Collateralized loans (Venice Fi + CENT)
- `/earn` - Stability pool deposits (CENT protocol)
- `/invest` - Genesis Vaults (currently placeholder, see `src/config/vaults.ts`)
- `/leverage` - Leverage positions (CENT protocol)
- `/redeem` - CENT redemption
- `/swap` - Cross-chain token swaps (SwapKit)
- `/portfolio` - Asset overview
- `/rewards` - CENT token rewards
- `/governance` - Governance (placeholder)
- `/pay` - Receive payments
- `/contacts` - Contact management
- `/settings` - App settings

All routes wrapped in `<Layout>` component (`src/components/Layout.tsx`) which includes mobile navigation.

### Design System

**Coinbase-inspired design** with custom CSS (not Tailwind):
- Design system CSS: `src/styles/design-system.css` and `src/styles/coinbase-design.css`
- Color palette: `--cb-orange: #FF9500`, `--cb-blue: #00DAFF`, `--cb-black: #000000`
- Component classes: `.cb-btn`, `.cb-card`, `.cb-input`, typography classes (`.cb-title`, `.cb-headline`, etc.)
- Mobile-first responsive design
- Pure black backgrounds (#000000)

### Environment Configuration

Required environment variables (copy `env.template` to `.env`):

```bash
# Network
VITE_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
VITE_CHAIN_ID=421614

# Reown AppKit (authentication)
VITE_REOWN_PROJECT_ID=your_project_id

# SwapKit (cross-chain swaps) - optional, uses mocks if not set
VITE_SWAPKIT_API_KEY=your_api_key
VITE_SWAPKIT_PROJECT_ID=your_project_id

# CENT Protocol addresses (JSON string)
VITE_CENT_ADDRESSES_JSON={"boldToken":"0x...","branches":[...]}
```

Access env vars via `getEnvOptional()` from `src/lib/runtime-env.ts` (not `import.meta.env` directly).

### Key Hooks

- `useWallet()` (`src/hooks/useWallet.ts`) - Wallet connection state
- `useVault()` (`src/hooks/useVault.ts`) - Genesis Vault interactions
- `useMarketData()` (`src/hooks/useMarketData.ts`) - Venice Fi market data
- `useTrove()` (`src/hooks/useTrove.ts`) - CENT trove (position) management
- `useStabilityPool()` (`src/hooks/useStabilityPool.ts`) - CENT stability pool deposits
- `usePortfolio()` (`src/hooks/usePortfolio.ts`) - User asset aggregation
- `useCentBalance()` (`src/hooks/useCentBalance.ts`) - CENT token balance tracking
- `usePrice()` (`src/hooks/usePrice.ts`) - Asset price fetching

## Testing

- **Framework**: Jest + Testing Library + ts-jest
- **Config**: `jest.config.ts` with jsdom environment
- **Test files**: `src/__tests__/*.test.tsx`
- Run single test: `npm test -- <filename>`

## Building & Deployment

```bash
# Build
npm run build                          # Output to dist/

# Deploy
netlify deploy --prod --dir=dist      # Netlify (recommended)
vercel --prod                          # Vercel

# Docker
docker build -t medici-app .
docker run -p 3000:80 medici-app
```

The Dockerfile uses multi-stage build (pnpm install → build → nginx serve).

## Import Organization

ESLint enforces import ordering via `simple-import-sort`:
1. React and external packages
2. Internal components
3. Path aliases (`#/...`)
4. Side effects
5. Parent imports
6. Relative imports
7. CSS imports

## Path Aliases

Configured in `vite.config.ts` and `tsconfig.json`:
- `assets/*` → `./src/assets/*`
- `shared/*` → `./src/shared/*`

## Important Notes

- **Package manager**: Project uses `pnpm` (see `pnpm-lock.yaml`), but `npm` also works
- **Venice Fi contracts**: Venice Fi Core deployment addresses in `src/config/contracts.ts` are for Arbitrum Sepolia testnet
- **CENT Protocol**: CENT addresses must be provided via `VITE_CENT_ADDRESSES_JSON` environment variable (JSON string with branch addresses)
- **Genesis Vaults**: Vault configuration exists (`src/config/vaults.ts`) but addresses are placeholders (`0x000...`)
- **Mock fallbacks**: SwapKit and some features gracefully degrade to mocks when API keys not configured
- **Subgraph dependency**: Some features (e.g., trove hints) expect a subgraph but fall back to on-chain calls
- **External dependencies**: The project references `bold-main/` and `USDaf-v2-main/` folders for ABIs (these appear to be git submodules or local copies)
- **License**: GPL-3.0 (per package.json), but README says "Proprietary - Venice Fi"
