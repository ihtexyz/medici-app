# Multi-Chain and Multi-Market Support Guide

## Overview
This guide explains how to add support for additional networks (like Ethereum Sepolia) and new collateral types to enable more lending markets similar to USDaf.

---

## ✅ Phase 1: Network Support (COMPLETED)

### Ethereum Sepolia Added
The app now supports **both** Arbitrum Sepolia and Ethereum Sepolia:

```typescript
// src/config/reown.ts
networks: [arbitrumSepolia, sepolia]
```

### What This Enables:
- Users can switch between Arbitrum Sepolia and Ethereum Sepolia in their wallet
- App will detect the current network and load appropriate contracts
- Network switcher available in Reown AppKit modal

---

## 📋 Phase 2: Adding New Collateral Types

### Current Supported Collaterals (Arbitrum Sepolia):
1. **WBTC18** - Wrapped Bitcoin
2. **cbBTC18** - Coinbase Wrapped Bitcoin

### USDaf Markets to Add:

Based on https://usdaf.asymmetry.finance/earn, here are the markets we can support:

#### **Individual Stability Pools** (Native to CENT Protocol):
These work with the existing architecture - just need deployment addresses:

1. **wBTC Stability Pool**
   - Status: Already supported (WBTC18)
   - APR: ~7.0%

2. **tBTC Stability Pool**
   - Token: Threshold Bitcoin
   - APR: ~0.4%
   - Needs: tBTC deployment on testnet

3. **ysyBOLD Stability Pool**
   - Token: Yield-bearing BOLD
   - APR: ~5.9%
   - Needs: ysyBOLD deployment on testnet

4. **scrvUSD Stability Pool**
   - Token: Staked Curve USD
   - APR: ~3.0%
   - Needs: scrvUSD deployment on testnet

5. **sfrxUSD Stability Pool**
   - Token: Staked Frax USD
   - APR: ~4.8%
   - Needs: sfrxUSD deployment on testnet

6. **sUSDS Stability Pool**
   - Token: Staked USDS (Sky Dollar)
   - APR: ~4.3%
   - Needs: sUSDS deployment on testnet

#### **External Pools** (Third-party Integrations):
These require additional development work:

1. **Pendle USDaf Pool**
   - Type: Yield trading platform integration
   - APR: ~12.50%
   - Requires: Pendle SDK integration

2. **Pendle sUSDaf Pool**
   - Type: Yield trading platform integration
   - APR: ~7.12%
   - Requires: Pendle SDK integration

3. **AF Power Pool**
   - Type: Asymmetry Finance aggregator
   - APR: ~11.95%
   - Requires: AF SDK integration

4. **LQTY Forks Pool**
   - Type: Liquity protocol aggregator
   - APR: ~29.20%
   - Requires: Custom aggregator integration

5. **DeFi Stable Avengers**
   - Type: Multi-protocol aggregator
   - APR: ~17.70%
   - Requires: Custom integration

6. **Supply USDC**
   - Type: Direct USDC lending
   - TVL: $544.85K
   - Requires: Aave/Compound integration

7. **Supply sUSDaf**
   - Type: Direct sUSDaf lending
   - APR: ~5.61%
   - Requires: Venus/similar integration

---

## 🔧 How to Add New Collateral Types

### Step 1: Deploy Collateral Token on Testnet

For each new collateral (e.g., tBTC, sfrxUSD), you need:

```solidity
// Example: Deploy mock ERC20 token for testing
contract MockTBTC is ERC20 {
    constructor() ERC20("Threshold Bitcoin", "tBTC") {
        _mint(msg.sender, 1000000 * 10**18);
    }

    // Testnet faucet function
    function tap() external {
        _mint(msg.sender, 1 * 10**18); // 1 tBTC
    }
}
```

### Step 2: Deploy CENT Branch for New Collateral

Using the CENT (Liquity v2) deployment scripts:

```bash
# Example: Deploy tBTC branch
cd bold-main/contracts
forge script script/DeployLiquity2.s.sol:DeployLiquity2 \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --sig "run(address,string)" \
  <TBTC_TOKEN_ADDRESS> \
  "tBTC"
```

This deploys:
- BorrowerOperations contract
- TroveManager contract
- StabilityPool contract
- SortedTroves contract
- PriceFeed oracle

### Step 3: Update Deployment Manifest

Add the new branch to your `.env` file:

```json
{
  "boldToken": "0x...",
  "collateralRegistry": "0x...",
  "hintHelpers": "0x...",
  "multiTroveGetter": "0x...",
  "branches": [
    {
      "collSymbol": "WBTC18",
      "collToken": "0x...",
      "borrowerOperations": "0x...",
      "sortedTroves": "0x...",
      "stabilityPool": "0x...",
      "troveManager": "0x...",
      "priceFeed": "0x..."
    },
    {
      "collSymbol": "cbBTC18",
      "collToken": "0x...",
      "borrowerOperations": "0x...",
      "sortedTroves": "0x...",
      "stabilityPool": "0x...",
      "troveManager": "0x...",
      "priceFeed": "0x..."
    },
    {
      "collSymbol": "tBTC",
      "collToken": "0x...",  // ← New tBTC token address
      "borrowerOperations": "0x...",  // ← New contracts
      "sortedTroves": "0x...",
      "stabilityPool": "0x...",
      "troveManager": "0x...",
      "priceFeed": "0x..."
    }
  ]
}
```

### Step 4: That's It! 🎉

The app will automatically:
- Load the new collateral type in the Borrow page dropdown
- Load the new stability pool in the Earn page dropdown
- Display positions on the Dashboard
- Show APR and stats

**No code changes needed** - the architecture is already multi-collateral ready!

---

## 🔌 Adding External Pool Integrations

For external pools like Pendle, Asymmetry Finance, etc., additional development is required:

### Example: Pendle Integration

1. **Install Pendle SDK**
```bash
pnpm add @pendle/sdk-v2
```

2. **Create Pendle Service** (`src/services/pendle.ts`)
```typescript
import { PendleSDK } from '@pendle/sdk-v2'

export async function depositToPendlePool(
  provider: any,
  poolAddress: string,
  amount: bigint
) {
  const sdk = new PendleSDK({
    chainId: 11155111, // Sepolia
    provider,
  })

  // Get pool contract
  const pool = await sdk.getPool(poolAddress)

  // Deposit
  return pool.deposit(amount)
}
```

3. **Add Pendle Tab to Earn Page**
```typescript
// In src/pages/Earn.tsx
const [earnType, setEarnType] = useState<'stability' | 'pendle'>('stability')

// Add tab switcher
<div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
  <button onClick={() => setEarnType('stability')}>
    Stability Pools
  </button>
  <button onClick={() => setEarnType('pendle')}>
    Pendle Pools
  </button>
</div>

{earnType === 'pendle' && <PendleEarnSection />}
```

---

## 🌐 Network-Specific Configuration

### Supporting Per-Network Deployments

The app can load different contract addresses per network:

```typescript
// src/config/cent.ts - Enhancement needed

export type NetworkConfig = {
  chainId: number
  addresses: CentAddresses
}

// Load based on current chain
export function getCentAddresses(chainId: number): CentAddresses | null {
  const configs: Record<number, string> = {
    421614: getEnv("VITE_CENT_ADDRESSES_ARB_SEPOLIA"),
    11155111: getEnv("VITE_CENT_ADDRESSES_ETH_SEPOLIA"),
  }

  const addressesJson = configs[chainId]
  if (!addressesJson) return null

  return JSON.parse(addressesJson)
}
```

### Environment Variables Structure

```bash
# .env file

# Arbitrum Sepolia
VITE_CENT_ADDRESSES_ARB_SEPOLIA='{"boldToken":"0x...","branches":[...]}'

# Ethereum Sepolia
VITE_CENT_ADDRESSES_ETH_SEPOLIA='{"boldToken":"0x...","branches":[...]}'
```

---

## 📊 Deployment Checklist

### For Each New Network:

- [ ] Deploy CENT core contracts (BoldToken, CollateralRegistry, etc.)
- [ ] Deploy HintHelpers (for gas optimization)
- [ ] Deploy MultiTroveGetter (for efficient data fetching)
- [ ] Update `.env` with network-specific addresses
- [ ] Test wallet connection and network switching
- [ ] Verify all contract interactions work

### For Each New Collateral:

- [ ] Deploy/verify collateral token on testnet
- [ ] Deploy CENT branch (BorrowerOperations, TroveManager, StabilityPool, etc.)
- [ ] Deploy price oracle (Chainlink or mock)
- [ ] Add to deployment manifest JSON
- [ ] Test borrow flow
- [ ] Test earn (stability pool) flow
- [ ] Verify faucet works for testnet

### For Each External Pool:

- [ ] Identify integration SDK/API
- [ ] Install required dependencies
- [ ] Create service layer (`src/services/[protocol].ts`)
- [ ] Add UI components
- [ ] Test deposit/withdraw flows
- [ ] Add APR fetching logic
- [ ] Update Dashboard to show external positions

---

## 🎯 Priority Recommendations

### High Priority (Easy Wins):
1. **Add tBTC Support** - Simple CENT branch deployment
2. **Add sfrxUSD Support** - Growing DeFi primitive
3. **Add sUSDS Support** - Sky/Maker integration

### Medium Priority:
4. **Pendle Integration** - High APR potential
5. **Curve Integration** - scrvUSD support
6. **Yearn Integration** - ysyBOLD support

### Low Priority (Complex):
7. **Aggregator Pools** - AF Power Pool, LQTY Forks, DeFi Stable Avengers
8. **Direct Lending** - Aave/Compound USDC pools

---

## 🧪 Testing Strategy

### Local Testing:
```bash
# Start local fork
anvil --fork-url https://sepolia.infura.io/v3/YOUR_KEY

# Deploy contracts
forge script script/DeployAll.s.sol --broadcast

# Update .env with local addresses
# Test in browser at localhost:5173
```

### Testnet Testing:
1. Deploy to Sepolia or Arbitrum Sepolia
2. Fund test accounts via faucets
3. Test all user flows
4. Monitor gas costs
5. Check for edge cases

### Mainnet Preparation:
1. Audit all contracts
2. Set up monitoring/alerts
3. Prepare emergency shutdown procedures
4. Configure proper oracles (Chainlink)
5. Set appropriate interest rate bounds

---

## 📈 Expected Impact

### With Full Multi-Market Support:

**Current:**
- 2 collateral types (WBTC, cbBTC)
- 2 stability pools
- 1 network (Arbitrum Sepolia)

**After Implementation:**
- 6+ collateral types (WBTC, cbBTC, tBTC, sfrxUSD, scrvUSD, sUSDS)
- 6+ stability pools
- 2 networks (Arbitrum + Ethereum Sepolia)
- 5+ external pool integrations (Pendle, Curve, etc.)
- **10-20x increase in earning opportunities** 🚀

**Estimated APR Range:**
- Stability Pools: 0.4% - 7.0%
- External Pools: 5.6% - 29.2%
- **Average APR: ~10-15%**

---

## 💡 Next Steps

1. **Choose 1-2 priority collaterals to add first** (recommend tBTC + sfrxUSD)
2. **Deploy on Ethereum Sepolia testnet**
3. **Test full borrow + earn flows**
4. **Add external pool integration** (start with Pendle)
5. **Iterate based on user feedback**

---

## 🔗 Useful Resources

- **CENT Protocol Docs**: See `bold-main/README.md`
- **USDaf Source**: https://usdaf.asymmetry.finance/
- **Pendle Docs**: https://docs.pendle.finance/
- **Curve Docs**: https://curve.readthedocs.io/
- **Frax Docs**: https://docs.frax.finance/
- **Sky/Maker Docs**: https://docs.sky.money/

---

**Last Updated:** 2025-10-25
**Status:** Ethereum Sepolia network support added ✅
**Next:** Deploy additional collateral branches
