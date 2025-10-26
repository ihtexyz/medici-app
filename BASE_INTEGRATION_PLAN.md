# Medici App - Base Integration Plan

**Date**: 2025-10-26
**Objective**: Make Medici a Base App with Base Account & Base Pay support
**Primary Chain**: Base Sepolia (Testnet) → Base (Mainnet)

---

## 🎯 Overview

Transform Medici into a **Base-native application** with:
1. **Base as Primary Chain** (Base Sepolia testnet)
2. **Base Account Integration** (ERC-4337 Smart Wallets)
3. **Base Pay Integration** (Coinbase Commerce Onchain Payment Protocol)
4. **OnchainKit Integration** (Base React Components)
5. **Multi-Chain Support** (Base, ETH, Arbitrum Sepolia)
6. **Extended Asset Support** (ETH, WBTC, USDC on all chains)
7. **ICP Integration** (Future: native ckBTC)

---

## 📊 Current vs Target Architecture

### Current State
```
Primary Chain: Arbitrum Sepolia (42161 testnet)
Auth: Reown AppKit
Assets: WBTC, cbBTC, CENT, USDC
Chains: ETH Sepolia (11155111), Arbitrum Sepolia (421614)
```

### Target State
```
Primary Chain: Base Sepolia (84532) → Base Mainnet (8453)
Auth: Base Account (Smart Wallet) + Reown AppKit (fallback)
Assets: ETH, WBTC, USDC, CENT (on Base, Arbitrum, Ethereum)
Chains: Base Sepolia, ETH Sepolia, Arbitrum Sepolia
Payments: Base Pay (Coinbase Commerce)
SDK: OnchainKit
```

---

## 🔧 Technical Requirements

### 1. Base Sepolia Network Configuration

**Chain Details**:
- Chain ID: `84532`
- Name: Base Sepolia
- RPC URL: `https://sepolia.base.org`
- Block Explorer: `https://sepolia.basescan.org`
- Currency: ETH

**Token Addresses** (Base Sepolia):
- WETH: `0x4200000000000000000000000000000000000006`
- USDC: `0x036cbd53842c5426634e7929541ec2318f3dcf7e`
- WBTC: `0x4131600fd78eb697413ca806a8f748edb959ddcd`

### 2. OnchainKit Integration

**Installation**:
```bash
npm install @coinbase/onchainkit
```

**Required Packages**:
```json
{
  "@coinbase/onchainkit": "latest",
  "viem": "^2.x",
  "wagmi": "^2.x"
}
```

**Configuration**:
- Coinbase Commerce API Key (for payments)
- OnchainKit Provider wrapper
- Base Account SDK integration

### 3. Base Account (Smart Wallet)

**Key Features**:
- ERC-4337 compliant smart wallets
- Passkey authentication (no seed phrases)
- Universal sign-on across Base apps
- Multi-chain support (9 EVM chains)
- Gas-less transactions (sponsored)
- Data vault for user info

**Integration Steps**:
1. Install Base Account SDK
2. Configure passkey authentication
3. Set up smart wallet deployment
4. Implement multi-chain support
5. Add data vault integration

### 4. Base Pay (Coinbase Commerce)

**Features**:
- Accept crypto payments in any token
- Automatic USDC settlement
- Guaranteed settlement (exact amount)
- Real-time transaction processing
- No payment errors

**Integration Steps**:
1. Sign up for Coinbase Commerce
2. Get Commerce API key
3. Install OnchainKit Checkout component
4. Configure payment flows
5. Handle payment webhooks

---

## 📋 Implementation Phases

### Phase 1: Base Chain Setup (Priority: HIGH)

**Tasks**:
1. ✅ Add Base Sepolia to chain configuration
2. ✅ Update RPC providers
3. ✅ Add Base token contracts (WETH, USDC, WBTC)
4. ✅ Configure Base Block Explorer
5. ✅ Update wallet connection to support Base
6. ✅ Test Base Sepolia connection

**Files to Modify**:
- `src/config/reown.ts` - Add Base chain
- `src/config/cent.ts` - Add Base token addresses
- Environment variables - Add BASE_RPC_URL

**Estimated Time**: 2-3 hours

### Phase 2: ETH Support on All Chains (Priority: HIGH)

**Tasks**:
1. ✅ Add ETH as supported asset
2. ✅ Create ETH balance fetching hooks
3. ✅ Add ETH to Portfolio display
4. ✅ Enable ETH swaps (SwapKit)
5. ✅ Add wrapped ETH (WETH) support

**New Features**:
- Display native ETH balance on all chains
- Wrap/Unwrap ETH functionality
- Use ETH for gas fees
- ETH price feeds

**Files to Create**:
- `src/hooks/useETHBalance.ts`
- `src/hooks/useWrapETH.ts`

**Estimated Time**: 3-4 hours

### Phase 3: OnchainKit Integration (Priority: HIGH)

**Tasks**:
1. ✅ Install OnchainKit
2. ✅ Wrap app with OnchainKitProvider
3. ✅ Replace wallet connection with OnchainKit components
4. ✅ Add Identity components (Name, Avatar, Badge)
5. ✅ Add Transaction components
6. ✅ Add Swap components (replace SwapKit?)
7. ✅ Add Fund components (onramp)

**Benefits**:
- Better Base integration
- Pre-built UI components
- Optimized for Base
- Base Account support

**Files to Modify**:
- `src/App.tsx` - Add OnchainKitProvider
- `src/components/Layout.tsx` - Use OnchainKit components
- `src/pages/*.tsx` - Replace manual implementations

**Estimated Time**: 4-6 hours

### Phase 4: Base Account Integration (Priority: MEDIUM)

**Tasks**:
1. ✅ Research Base Account SDK
2. ✅ Add passkey authentication
3. ✅ Implement smart wallet creation
4. ✅ Add smart wallet connect option
5. ✅ Enable multi-chain operations
6. ✅ Add data vault integration
7. ✅ Migrate existing users (optional)

**User Experience**:
- Option to "Create Base Account"
- Passkey setup flow
- Seamless multi-chain experience
- No seed phrases
- Gas-less transactions (if sponsored)

**Files to Create**:
- `src/hooks/useBaseAccount.ts`
- `src/components/BaseAccountSetup.tsx`
- `src/services/baseAccount.ts`

**Estimated Time**: 6-8 hours

### Phase 5: Base Pay Integration (Priority: MEDIUM)

**Tasks**:
1. ✅ Sign up for Coinbase Commerce
2. ✅ Get Commerce API key
3. ✅ Add Checkout component
4. ✅ Configure payment products
5. ✅ Implement payment flows
6. ✅ Add payment history
7. ✅ Handle webhooks (backend needed?)

**Use Cases**:
- Buy CENT with any crypto
- Pay for premium features
- In-app purchases
- Subscription payments

**Files to Create**:
- `src/components/BasePayCheckout.tsx`
- `src/hooks/useBasePay.ts`
- `src/services/basePay.ts`

**Estimated Time**: 4-6 hours

### Phase 6: CENT Protocol on Base (Priority: MEDIUM)

**Tasks**:
1. ❓ Deploy CENT contracts to Base Sepolia (or use existing?)
2. ✅ Add Base branch to CENT config
3. ✅ Update borrow/lend UI for Base
4. ✅ Add Base stability pools
5. ✅ Test CENT borrowing on Base
6. ✅ Add Base → Arbitrum bridge (if needed)

**Questions**:
- Are CENT contracts already deployed on Base?
- Do we need to deploy new contracts?
- How do we handle liquidity across chains?

**Estimated Time**: 8-12 hours (if deploying contracts)

### Phase 7: Multi-Chain Asset Management (Priority: LOW)

**Tasks**:
1. ✅ Show assets on all chains in Portfolio
2. ✅ Add chain switcher UI
3. ✅ Enable cross-chain swaps
4. ✅ Add bridge recommendations
5. ✅ Show gas costs on each chain

**User Experience**:
- See "Total BTC: 0.15" (across all chains)
- Click to see breakdown by chain
- Easy chain switching
- Recommended bridges

**Estimated Time**: 4-6 hours

### Phase 8: ICP Integration Prep (Priority: FUTURE)

**Tasks**:
1. ⏳ Research ckBTC bridge to Base
2. ⏳ Add ckBTC as collateral option
3. ⏳ Document ICP → Base flow
4. ⏳ Create user guides

**Timeline**: 2-3 months

---

## 🔑 Environment Variables Required

```env
# Base Configuration
VITE_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
VITE_BASE_MAINNET_RPC_URL=https://mainnet.base.org

# OnchainKit
VITE_ONCHAINKIT_API_KEY=your_onchainkit_api_key

# Coinbase Commerce
VITE_COMMERCE_API_KEY=your_commerce_api_key
VITE_COMMERCE_PROJECT_ID=your_project_id

# Base Account
VITE_BASE_ACCOUNT_APP_ID=your_app_id

# Existing (keep these)
VITE_REOWN_PROJECT_ID=...
VITE_BRIDGE_API_KEY=...
VITE_SWAPKIT_API_KEY=...
```

---

## 🎨 UI/UX Changes

### New Components Needed

1. **ChainSwitcher** - Switch between Base, Arbitrum, Ethereum
2. **BaseAccountSetup** - Create/connect Base Account
3. **BasePayCheckout** - Accept payments
4. **MultiChainBalance** - Show balances across chains
5. **WrapETHModal** - Wrap/unwrap ETH

### Updated Components

1. **Portfolio** - Show multi-chain balances
2. **Borrow** - Support Base chain
3. **Swap** - Use OnchainKit Swap or keep SwapKit?
4. **Bank** - Integrate Base Pay for on/off ramp
5. **Layout** - Add Base branding

---

## 📊 Asset Support Matrix

| Asset | Base Sepolia | Arbitrum Sepolia | ETH Sepolia | Use Case |
|-------|--------------|------------------|-------------|----------|
| ETH   | ✅ Native     | ✅ Native        | ✅ Native    | Gas, collateral |
| WETH  | ✅ (0x4200...)| ✅ TBD          | ✅ TBD       | DeFi, swaps |
| USDC  | ✅ (0x036c...)| ✅ TBD          | ✅ TBD       | Stablecoin |
| WBTC  | ✅ (0x4131...)| ✅ TBD          | ✅ TBD       | Bitcoin exposure |
| cbBTC | ❓ TBD       | ✅ Existing     | ❓ TBD      | Coinbase BTC |
| CENT  | ❓ Deploy?   | ✅ Existing     | ❌ No       | Stablecoin |
| ckBTC | ⏳ Future    | ⏳ Future       | ⏳ Future   | ICP native BTC |

---

## 🚀 Migration Strategy

### For Existing Users

**Option 1: Soft Migration** (Recommended)
- Add Base as new chain option
- Keep Arbitrum as fallback
- Let users choose primary chain
- Gradual migration over time

**Option 2: Hard Migration**
- Migrate all users to Base
- Provide bridge tools
- Sunset Arbitrum support
- Faster but riskier

**Recommended**: Option 1 (Soft Migration)

### For New Users

- Default to Base Sepolia
- Offer Base Account creation
- Simpler onboarding
- Better UX with Base features

---

## ⚠️ Risks & Mitigation

### Technical Risks

1. **Smart Contract Deployment**
   - Risk: CENT contracts may not exist on Base
   - Mitigation: Deploy contracts or use existing base stablecoins

2. **Liquidity Fragmentation**
   - Risk: Splitting liquidity across chains
   - Mitigation: Focus on Base, use bridges

3. **Gas Costs**
   - Risk: Multiple chains = multiple gas costs
   - Mitigation: Use Base (cheaper), sponsor gas with Base Account

4. **Integration Complexity**
   - Risk: OnchainKit may conflict with existing code
   - Mitigation: Gradual migration, thorough testing

### User Experience Risks

1. **Confusion**
   - Risk: Too many chain options
   - Mitigation: Clear UI, recommend Base as default

2. **Migration Friction**
   - Risk: Users don't want to switch chains
   - Mitigation: Make it optional, show benefits

---

## 📈 Success Metrics

### Technical Metrics
- ✅ Base Sepolia connection working
- ✅ All assets tradeable on Base
- ✅ Base Account creation flow working
- ✅ Base Pay transactions processing
- ✅ <1s transaction confirmation on Base

### Business Metrics
- 📊 % of users choosing Base over Arbitrum
- 📊 Transaction volume on Base
- 📊 Base Pay payment volume
- 📊 Smart wallet adoption rate
- 📊 User retention after Base migration

---

## 🎯 Immediate Next Steps

### Week 1: Research & Planning
1. ✅ Review all Base documentation
2. ✅ Create implementation plan (this document)
3. ⏳ Get Coinbase Commerce account
4. ⏳ Get OnchainKit API key
5. ⏳ Review CENT contract deployment options

### Week 2: Base Chain Setup
1. ⏳ Add Base Sepolia to config
2. ⏳ Test Base connection
3. ⏳ Add Base tokens
4. ⏳ Update Portfolio for Base

### Week 3: OnchainKit Integration
1. ⏳ Install OnchainKit
2. ⏳ Add OnchainKitProvider
3. ⏳ Replace wallet components
4. ⏳ Test all features

### Week 4: Base Account & Pay
1. ⏳ Implement Base Account
2. ⏳ Implement Base Pay
3. ⏳ User testing
4. ⏳ Bug fixes

---

## 📚 Resources

### Documentation
- Base Docs: https://docs.base.org
- OnchainKit: https://onchainkit.xyz
- Base Account: https://docs.base.org/base-account
- Coinbase Commerce: https://commerce.coinbase.com
- Base Sepolia Explorer: https://sepolia.basescan.org

### APIs & SDKs
- OnchainKit: `@coinbase/onchainkit`
- Base Account SDK: TBD
- Commerce SDK: TBD

### Community
- Base Discord: discord.gg/base
- Builder Chat: base.org/builders
- GitHub: github.com/base-org

---

## 🏆 Expected Outcomes

### User Benefits
- ✅ Faster transactions (Base is faster than Arbitrum)
- ✅ Lower gas fees (Base is cheaper)
- ✅ Better UX with Base Account (no seed phrases)
- ✅ Seamless payments with Base Pay
- ✅ Multi-chain flexibility

### Business Benefits
- ✅ Base App certification & visibility
- ✅ Access to Base ecosystem
- ✅ Coinbase integration
- ✅ Better monetization with Base Pay
- ✅ Competitive advantage

### Technical Benefits
- ✅ Modern tech stack (OnchainKit)
- ✅ Better developer experience
- ✅ Easier maintenance
- ✅ Future-proof architecture

---

**Status**: ✅ PLAN COMPLETE - Ready for Implementation
**Next Action**: Get Coinbase Commerce account & OnchainKit API key
**Estimated Total Time**: 4-6 weeks for full implementation
**Recommended Approach**: Phased rollout with Base as primary chain

_Plan Created: 2025-10-26_
_Target Completion: Q1 2025_
