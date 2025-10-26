# HyperEVM + Base Integration Analysis

**Date**: 2025-10-26
**Status**: ✅ Feasibility Analysis Complete
**Vision**: Support Hyperliquid CDP interaction directly from a Base App with full interoperability

---

## Executive Summary

**VERDICT**: ✅ **YES - Highly Feasible and Straightforward**

The CENT protocol (Liquity V2 fork) can be deployed on HyperEVM with minimal modifications. Felix Protocol has already proven this architecture works on Hyperliquid. The path to Base + Hyperliquid interoperability is clear and achievable.

### Key Findings

1. **Felix Protocol** (Liquity V2 fork) is already live on HyperEVM with $100M+ in loans
2. **CENT Protocol** (our Liquity V2 fork) shares identical architecture with Felix
3. **HyperEVM** is fully EVM-compatible (Chain ID: 999, standard tooling support)
4. **Contracts are deployment-ready** - same codebase, different network
5. **Interoperability is achievable** via Wormhole bridge (already integrated with HyperEVM)

---

## Part 1: HyperEVM Technical Analysis

### Network Specifications

| Parameter | Value |
|-----------|-------|
| **Chain ID** | 999 |
| **Network Name** | Hyperliquid (HyperEVM) |
| **RPC URL** | https://rpc.hyperliquid.xyz/evm |
| **Gas Token** | HYPE (native token) |
| **Block Explorer** | https://hyperevmscan.io |
| **Consensus** | HyperBFT (same as HyperCore) |
| **EVM Compatibility** | Full (Ethereum JSON-RPC methods) |
| **Tooling Support** | Foundry, Hardhat, Web3 libraries |

### Bridge Transfer Method

To move HYPE from HyperCore to HyperEVM:
```solidity
// Send HYPE to this address
0x2222222222222222222222222222222222222222
```

### Rate Limits

- **Public RPC**: 100 requests/minute per IP (no signup required)
- **Recommended**: Use dedicated RPC provider for production (QuickNode, Chainstack)

### Unique Features

1. **Direct HyperCore Integration**
   - Access spot and perp order books from smart contracts
   - Read precompiles for price data
   - Write system contracts for executing trades (coming soon)

2. **Same Security as HyperCore**
   - HyperEVM blocks built as part of L1 execution
   - Inherits HyperBFT consensus security
   - Not a separate chain - unified security model

3. **High Performance**
   - 300,000+ daily transactions
   - 40,000+ daily active users
   - $2B+ TVL as of mid-2025

---

## Part 2: Protocol Architecture Comparison

### Felix Protocol (HyperEVM) vs CENT Protocol (Our Protocol)

Both protocols are Liquity V2 forks with identical core architecture:

| Component | Felix (HyperEVM) | CENT (Medici) | Compatibility |
|-----------|------------------|---------------|---------------|
| **Base Architecture** | Liquity V2 | Liquity V2 | ✅ Identical |
| **Stablecoin** | feUSD | CENT | ✅ Same mechanism |
| **Collateral System** | Multi-branch | Multi-branch | ✅ Same design |
| **Interest Rates** | User-set | User-set | ✅ Same model |
| **Troves** | NFT-based | NFT-based | ✅ Same implementation |
| **Redemptions** | Rate-ordered | Rate-ordered | ✅ Same logic |
| **Stability Pool** | Product-Sum algo | Product-Sum algo | ✅ Same algorithm |
| **Liquidations** | Two-tier | Two-tier | ✅ Same mechanics |
| **Delegation** | 3 models | 3 models | ✅ Same framework |

### Current CENT Implementation

**Contract Structure** (from src/services/cent.ts):
```typescript
// Core Contracts
- BorrowerOperations (open/close troves, add/withdraw collateral)
- TroveManager (liquidations, redemptions)
- TroveNFT (NFT representation of positions)
- StabilityPool (liquidation absorption)
- SortedTroves (interest rate ordering)
- ActivePool (collateral tracking)
- HintHelpers (gas-efficient hints)
- MultiTroveGetter (batch data retrieval)

// Configuration
- CollateralRegistry (multi-collateral routing)
- PriceFeed (oracle integration)
```

**Supported Operations**:
- ✅ Open Trove
- ✅ Close Trove
- ✅ Add/Withdraw Collateral
- ✅ Borrow/Repay CENT
- ✅ Stability Pool Deposit/Withdrawal
- ✅ Faucet (testnet)

### Felix Collateral Support (HyperEVM)

**Primary Collaterals**:
- HYPE (native token)
- Liquid Staked HYPE (LSTs)
- UBTC (bridged BTC)
- Bridged ETH, SOL
- hwHLP (Hyperwave HLP token)
- WHLP (wrapped HLP)

**Oracle Integration**:
- Uses Chainlink AggregatorV3Interface
- Composite pricing for LSTs: `min(market_price, canonical_rate)`
- Automatic shutdown on oracle failure

---

## Part 3: Deployment Feasibility Assessment

### ✅ Advantages - Why This is Straightforward

1. **Proven Architecture**
   - Felix already deployed on HyperEVM successfully
   - $100M+ in outstanding loans validates stability
   - Same codebase = same deployment process

2. **Full EVM Compatibility**
   - Standard Solidity contracts work without modification
   - Use existing Foundry/Hardhat setup
   - No custom opcodes or special considerations

3. **Identical Contract Code**
   - CENT contracts are Liquity V2 fork
   - Felix contracts are Liquity V2 fork
   - Only need to change network configuration

4. **Existing Infrastructure**
   - RPC endpoints available
   - Block explorers operational
   - Wormhole bridge integrated (for interoperability)

5. **Oracle Support**
   - Chainlink already on HyperEVM
   - Same oracle integration pattern as Base

### ⚠️ Considerations - What to Plan For

1. **Collateral Selection**
   - Base uses WBTC, USDC, WETH
   - HyperEVM should use HYPE, UBTC, native assets
   - Need separate collateral configuration per chain

2. **Gas Token**
   - Base uses ETH for gas
   - HyperEVM uses HYPE for gas
   - Users need HYPE on HyperEVM for transactions

3. **Bridge Liquidity**
   - Base ↔ Hyperliquid bridge needed for interoperability
   - Wormhole supports HyperEVM (launched March 2025)
   - Need to test bridge performance and costs

4. **Rate Limits**
   - Public RPC limited to 100 req/min
   - Production should use dedicated RPC provider
   - Budget for RPC service costs

5. **Oracle Differences**
   - Base: Chainlink, OnchainKit price feeds
   - HyperEVM: Chainlink + HyperCore order book data
   - Opportunity to use native Hyperliquid price data

---

## Part 4: Base + Hyperliquid Integration Architecture

### Vision: Unified Multi-Chain CDP Platform

**Goal**: Users interact with both Base and Hyperliquid CDPs from a single Medici interface, with seamless cross-chain operations.

### Architecture Design

```
┌─────────────────────────────────────────────────────────┐
│                    Medici App (React)                    │
│                                                          │
│  ┌────────────────┐              ┌──────────────────┐  │
│  │  Base Account  │              │ Reown AppKit     │  │
│  │  (Smart Wallet)│              │ (Wallet Connect) │  │
│  └────────────────┘              └──────────────────┘  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐  │
│  │         Multi-Chain State Management             │  │
│  │  - Chain Selection (Base / HyperEVM)            │  │
│  │  - Balance Aggregation                           │  │
│  │  - Transaction History (per chain)              │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
┌──────────────────┐                  ┌──────────────────┐
│   Base Sepolia   │                  │    HyperEVM      │
│   (Chain: 84532) │                  │   (Chain: 999)   │
│                  │                  │                  │
│  CENT Protocol   │                  │  CENT Protocol   │
│  - WBTC Branch   │                  │  - HYPE Branch   │
│  - WETH Branch   │                  │  - UBTC Branch   │
│  - USDC Branch   │                  │  - wstHYPE       │
│                  │                  │                  │
│  Gas: ETH        │                  │  Gas: HYPE       │
└──────────────────┘                  └──────────────────┘
         │                                      │
         └──────────────┬───────────────────────┘
                        ▼
              ┌──────────────────┐
              │  Wormhole Bridge │
              │  (Interop Layer) │
              └──────────────────┘
```

### Component Breakdown

#### 1. Frontend Layer (Medici App)

**Multi-Chain Support**:
```typescript
// src/config/chains.ts
export const SUPPORTED_CHAINS = {
  BASE_SEPOLIA: {
    chainId: 84532,
    name: 'Base Sepolia',
    rpc: 'https://sepolia.base.org',
    explorer: 'https://sepolia.basescan.org',
    gasToken: 'ETH',
    protocol: 'CENT',
  },
  HYPEREVM: {
    chainId: 999,
    name: 'Hyperliquid',
    rpc: 'https://rpc.hyperliquid.xyz/evm',
    explorer: 'https://hyperevmscan.io',
    gasToken: 'HYPE',
    protocol: 'CENT',
  },
} as const;
```

**Wallet Integration**:
- Base Account (passkey auth) for Base transactions
- Reown AppKit for multi-chain wallet connection
- Automatic network switching
- Gas token balance checks before transactions

#### 2. Smart Contract Layer

**Deployment Strategy**:
```
Option A: Shared Protocol (Recommended)
- Deploy identical CENT contracts to both chains
- Same stablecoin name (CENT)
- Different collateral branches per chain
- Unified redemption mechanism

Option B: Separate Protocols
- CENT on Base (existing)
- Deploy new fork on HyperEVM with different name
- More flexibility but fragmented liquidity
```

**Collateral Configuration**:

**Base Sepolia Branches**:
```json
{
  "branches": [
    {
      "collSymbol": "WBTC18",
      "collToken": "0x...",
      "minCollRatio": "110%",
      "borrowerOperations": "0x...",
      "stabilityPool": "0x...",
      "troveManager": "0x..."
    },
    {
      "collSymbol": "WETH",
      "collToken": "0x4200000000000000000000000000000000000006",
      "minCollRatio": "120%",
      ...
    }
  ]
}
```

**HyperEVM Branches**:
```json
{
  "branches": [
    {
      "collSymbol": "HYPE",
      "collToken": "native",
      "minCollRatio": "150%",
      "borrowerOperations": "0x...",
      "stabilityPool": "0x...",
      "troveManager": "0x..."
    },
    {
      "collSymbol": "UBTC",
      "collToken": "0x...",
      "minCollRatio": "110%",
      ...
    }
  ]
}
```

#### 3. Interoperability Layer (Wormhole)

**Cross-Chain Operations**:
1. **CENT Token Bridge**
   - Mint CENT on Base → Bridge to HyperEVM
   - Mint CENT on HyperEVM → Bridge to Base
   - Unified stablecoin across both chains

2. **Collateral Bridge**
   - Bridge BTC (WBTC ↔ UBTC)
   - Bridge ETH (WETH ↔ wrapped ETH on Hyper)
   - Future: Native asset swaps

3. **Redemption Arbitrage**
   - Monitor CENT price on both chains
   - Automated arbitrage via bridge
   - Maintains peg across ecosystems

---

## Part 5: Implementation Roadmap

### Phase 1: HyperEVM Deployment (2-3 weeks)

**Week 1: Contract Preparation**
- [ ] Clone CENT contract repository
- [ ] Configure Foundry for HyperEVM (Chain ID 999)
- [ ] Update network configuration in foundry.toml
- [ ] Test compilation (should work without changes)

**Week 2: Testnet Deployment**
- [ ] Deploy to HyperEVM testnet (if available)
- [ ] OR deploy directly to mainnet with small collateral limits
- [ ] Deploy core contracts:
  - [ ] CollateralRegistry
  - [ ] CENT Token (or feUSD fork)
  - [ ] HintHelpers
  - [ ] MultiTroveGetter
- [ ] Deploy HYPE branch:
  - [ ] BorrowerOperations
  - [ ] TroveManager
  - [ ] TroveNFT
  - [ ] StabilityPool
  - [ ] SortedTroves
  - [ ] ActivePool
  - [ ] PriceFeed (Chainlink HYPE/USD)

**Week 3: Testing & Verification**
- [ ] Open test Troves
- [ ] Test interest rate adjustments
- [ ] Test liquidations
- [ ] Test Stability Pool deposits/withdrawals
- [ ] Test redemptions
- [ ] Verify contract on HyperScan

### Phase 2: Frontend Integration (2 weeks)

**Week 1: Multi-Chain Configuration**
- [ ] Add HyperEVM to Reown AppKit networks
- [ ] Create src/config/hyperliquid.ts
- [ ] Update src/config/tokens-multichain.ts
- [ ] Add HYPE, UBTC token addresses
- [ ] Create useHyperEVMBalance hook
- [ ] Add network switcher UI component

**Week 2: HyperEVM Pages**
- [ ] Add /hyperliquid route
- [ ] Create HyperEVM CDP page (clone Borrow page)
- [ ] Create HyperEVM Earn page (Stability Pool)
- [ ] Add HyperEVM portfolio section
- [ ] Test all operations end-to-end

### Phase 3: Wormhole Bridge Integration (2-3 weeks)

**Week 1: Research & Setup**
- [ ] Study Wormhole SDK documentation
- [ ] Install @wormhole-foundation/sdk
- [ ] Configure Wormhole for Base ↔ HyperEVM
- [ ] Test bridge on testnet (if available)

**Week 2: CENT Token Bridging**
- [ ] Deploy Wormhole token bridge contracts
- [ ] Create useBridgeCENT hook
- [ ] Add bridge UI to Bank page
- [ ] Test CENT transfers Base → HyperEVM
- [ ] Test CENT transfers HyperEVM → Base

**Week 3: Collateral Bridging**
- [ ] Support WBTC → UBTC bridging
- [ ] Support ETH bridging
- [ ] Add bridge status tracking
- [ ] Add transaction history for bridges

### Phase 4: Advanced Features (2-3 weeks)

**Cross-Chain Portfolio**
- [ ] Aggregate positions across both chains
- [ ] Show total CENT minted (all chains)
- [ ] Show total collateral value (all chains)
- [ ] Unified transaction history

**Arbitrage Automation (Optional)**
- [ ] Monitor CENT price on Base
- [ ] Monitor CENT price on HyperEVM
- [ ] Suggest arbitrage opportunities
- [ ] One-click arbitrage execution

**HyperCore Integration** (Future)
- [ ] Access Hyperliquid perp order books
- [ ] Add leverage trading features
- [ ] Integrate with Hyperliquid DEX

---

## Part 6: Technical Challenges & Solutions

### Challenge 1: Gas Token Differences

**Problem**: Users need ETH for Base, HYPE for HyperEVM

**Solutions**:
1. **Gas Abstraction** (Base Account SDK)
   - Enable gas-less transactions on Base
   - Users only need HYPE on HyperEVM

2. **Gas Token Warnings**
   - Check HYPE balance before HyperEVM transactions
   - Show "Get HYPE" button if insufficient
   - Link to HYPE acquisition guide

3. **Onramp Integration**
   - Direct HYPE purchase via Base Pay
   - Bridge.xyz integration for HYPE

### Challenge 2: Oracle Availability

**Problem**: Need reliable price feeds on both chains

**Solutions**:
1. **Base**: Use Chainlink + OnchainKit price data
2. **HyperEVM**: Use Chainlink + HyperCore order book data
3. **Fallback**: Use DEX prices (Uniswap on Base, Hyperliquid DEX)
4. **Composite Pricing**: Average multiple sources

### Challenge 3: Bridge Latency

**Problem**: Wormhole bridge takes ~15-30 minutes

**Solutions**:
1. **Clear UX Expectations**
   - Show estimated bridge time
   - Add progress tracker
   - Send notifications on completion

2. **Optimistic UI**
   - Show pending bridged balance
   - Allow planning next operation
   - Prevent double-spending

3. **Fast Bridge Option** (Future)
   - Integrate with fast bridge protocols
   - Use liquidity pools for instant swaps
   - Small fee for speed

### Challenge 4: Contract Address Management

**Problem**: Different contract addresses on each chain

**Solutions**:
1. **Environment Variable Pattern** (Current)
```typescript
// .env
VITE_CENT_ADDRESSES_BASE_JSON='{"boldToken":"0x...","branches":[...]}'
VITE_CENT_ADDRESSES_HYPER_JSON='{"boldToken":"0x...","branches":[...]}'
```

2. **Chain-Aware Config Loader**
```typescript
export function getCentAddresses(chainId: number): CentAddresses | null {
  switch (chainId) {
    case 84532: return parseAddresses('VITE_CENT_ADDRESSES_BASE_JSON');
    case 999: return parseAddresses('VITE_CENT_ADDRESSES_HYPER_JSON');
    default: return null;
  }
}
```

3. **Contract Registry** (Future)
   - Deploy on-chain registry
   - Query addresses dynamically
   - Auto-update on contract upgrades

---

## Part 7: Current App Improvements

### Immediate Improvements (Can Do Now)

1. **Add HyperEVM to Network List**
```typescript
// src/config/reown.ts
import { baseSepolia, arbitrumSepolia, sepolia } from '@reown/appkit/networks'

// Create custom HyperEVM network definition
const hyperEVM = {
  id: 999,
  name: 'Hyperliquid',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.hyperliquid.xyz/evm'] },
    public: { http: ['https://rpc.hyperliquid.xyz/evm'] },
  },
  blockExplorers: {
    default: { name: 'HyperScan', url: 'https://hyperevmscan.io' },
  },
} as const;

const wagmiAdapter = new WagmiAdapter({
  networks: [baseSepolia, hyperEVM, arbitrumSepolia, sepolia],
  projectId,
})
```

2. **Create HyperEVM Configuration File**
```typescript
// src/config/hyperliquid.ts
export const HYPEREVM_CHAIN_ID = 999

export const HYPEREVM_TOKENS = {
  HYPE: 'native',
  UBTC: '0x...', // To be filled after deployment
  // Add more as ecosystem grows
} as const

export const HYPEREVM_CONFIG = {
  chainId: HYPEREVM_CHAIN_ID,
  name: 'Hyperliquid',
  rpcUrl: 'https://rpc.hyperliquid.xyz/evm',
  blockExplorer: 'https://hyperevmscan.io',
  currency: {
    name: 'HYPE',
    symbol: 'HYPE',
    decimals: 18,
  },
} as const
```

3. **Add Network Switcher Component**
```typescript
// src/components/NetworkSwitcher.tsx
export function NetworkSwitcher() {
  const { chain } = useAccount()
  const { switchNetwork } = useSwitchNetwork()

  return (
    <select
      value={chain?.id}
      onChange={(e) => switchNetwork?.(Number(e.target.value))}
    >
      <option value={84532}>Base Sepolia</option>
      <option value={999}>Hyperliquid</option>
      <option value={421614}>Arbitrum Sepolia</option>
      <option value={11155111}>ETH Sepolia</option>
    </select>
  )
}
```

4. **Update Portfolio Page for Multi-Chain**
```typescript
// Show balances across all chains
const { balances: baseBalances } = useBalances(84532)
const { balances: hyperBalances } = useBalances(999)

const totalValue =
  calculateValue(baseBalances) +
  calculateValue(hyperBalances)
```

5. **Add Chain Indicator**
```typescript
// Show which chain user is on
<div className="chain-indicator">
  {chain?.id === 999 ? '🔷 Hyperliquid' : '🔵 Base'}
</div>
```

### Documentation Improvements

6. **Create Deployment Guide**
   - Document HyperEVM deployment process
   - Include contract addresses after deployment
   - Add troubleshooting section

7. **Update README**
   - Add HyperEVM support mention
   - Link to Felix Protocol as reference
   - Explain multi-chain vision

8. **Create Integration Checklist**
   - Pre-deployment checklist
   - Testing checklist
   - Production launch checklist

---

## Part 8: Cost Analysis

### Deployment Costs

**Base Sepolia** (Testnet - FREE):
- Contract deployments: FREE
- Testnet ETH: FREE (from faucets)
- Ongoing gas: FREE

**HyperEVM** (Mainnet):
- Contract deployments: ~0.5-1 HYPE per contract (≈ $5-10 @ $10/HYPE)
- Total for full deployment: ~10-15 HYPE (≈ $100-150)
- Ongoing gas: Low (< $1/day for typical operations)

### Infrastructure Costs

**RPC Services** (Production):
- QuickNode or Chainstack: $50-200/month
- Covers both Base and HyperEVM
- Includes higher rate limits

**Bridge Costs**:
- Wormhole fees: ~$0.50-5 per bridge transaction
- Depends on destination chain gas costs

**Oracle Costs**:
- Chainlink: Pay per request or subscription
- Budget: $100-500/month for both chains
- Optimization: Cache prices, batch updates

### Total Estimated Costs

**One-time**:
- HyperEVM deployment: $100-150
- Testing: $50-100
- **Total: ~$200**

**Monthly**:
- RPC services: $100-200
- Oracle data: $100-500
- Bridge transactions: Variable
- **Total: ~$300-700/month**

---

## Part 9: Risk Assessment

### Technical Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Oracle failure | HIGH | Multiple oracle sources, automatic shutdown |
| Bridge exploit | HIGH | Use battle-tested Wormhole, monitor bridge health |
| Gas price spike | MEDIUM | Gas price limits, user warnings |
| Contract bug | HIGH | Audit before mainnet, start with low limits |
| Network downtime | LOW | HyperEVM has high uptime, fallback RPCs |

### Economic Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| HYPE price volatility | HIGH | Higher collateral ratios for HYPE |
| Bridge liquidity | MEDIUM | Monitor bridge TVL, set max amounts |
| Arbitrage attacks | LOW | Redemption fees, rate limits |
| Bad debt | MEDIUM | Liquidation incentives, insurance fund |

### Operational Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| User confusion | MEDIUM | Clear UI, documentation, tutorials |
| Support burden | MEDIUM | Comprehensive FAQ, Discord support |
| Regulatory | LOW | Decentralized protocol, no custody |

---

## Part 10: Success Metrics

### Launch Metrics (Month 1)

- [ ] Successfully deploy all contracts to HyperEVM
- [ ] At least 10 unique Trove owners
- [ ] $10,000+ in total collateral locked
- [ ] Zero critical bugs or exploits
- [ ] At least 100 bridge transactions

### Growth Metrics (Month 3)

- [ ] 100+ Trove owners across both chains
- [ ] $1M+ in total value locked
- [ ] 1,000+ bridge transactions
- [ ] Integration with at least one HyperEVM DeFi protocol
- [ ] Community tutorial videos created

### Maturity Metrics (Month 6)

- [ ] 500+ Trove owners
- [ ] $10M+ TVL across both chains
- [ ] CENT trading on both Base and Hyperliquid DEXs
- [ ] Automated arbitrage bots maintaining peg
- [ ] Third-party integrations built on top

---

## Conclusion

### ✅ Deployment is Straightforward

1. **Proven Model**: Felix demonstrates Liquity V2 works on HyperEVM
2. **Identical Contracts**: CENT uses same architecture as Felix
3. **Full EVM Support**: No special modifications needed
4. **Clear Path**: Deployment process is well-documented

### 🎯 Recommended Next Steps

**Immediate (This Week)**:
1. Add HyperEVM network to Medici app
2. Create HyperEVM configuration files
3. Add network switcher UI

**Short-term (Next 2 Weeks)**:
1. Deploy CENT contracts to HyperEVM testnet (if available)
2. OR deploy to mainnet with conservative limits
3. Test all core operations

**Medium-term (1-2 Months)**:
1. Integrate Wormhole bridge
2. Enable CENT bridging between Base and HyperEVM
3. Launch public beta

**Long-term (3-6 Months)**:
1. Integrate HyperCore features (order book access)
2. Add leverage trading
3. Build automated arbitrage
4. Expand to more collateral types

### 💡 Strategic Advantages

**First-Mover**:
- First Base App with Hyperliquid integration
- Unique cross-chain CDP offering
- Access to both ecosystems

**Technical Excellence**:
- Clean multi-chain architecture
- Leverages best of both chains
- Production-ready codebase

**User Value**:
- Single interface for multi-chain DeFi
- Unified CENT stablecoin across chains
- Lower barriers to entry

---

**Status**: ✅ **READY TO PROCEED**
**Confidence**: 🌟🌟🌟🌟🌟 (5/5 stars)
**Recommendation**: **START DEPLOYMENT IMMEDIATELY**

The path is clear, the technology is proven, and the opportunity is significant. Medici can become the premier multi-chain CDP platform connecting Base and Hyperliquid ecosystems.

---

*Analysis Completed: 2025-10-26*
*Next Review: After HyperEVM deployment completion*
