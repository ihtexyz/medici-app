# CENT Protocol Deployment Guide - HyperEVM

**Date**: 2025-10-26
**Network**: HyperEVM (Hyperliquid) Chain ID 999
**Status**: Ready for Deployment

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Collateral Configuration](#collateral-configuration)
3. [Deployment Process](#deployment-process)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

```bash
# Foundry (already installed in USDaf-v2-main/contracts)
cd USDaf-v2-main/contracts
forge --version

# Node.js and pnpm (for frontend integration)
node --version
pnpm --version
```

### Required Funds

**Deployer Wallet**:
- Minimum 10-15 HYPE for gas costs
- Estimated deployment cost: ~10 HYPE ($100-150 @ $10/HYPE)
- Recommended: 20 HYPE for safety buffer

**Get HYPE**:
1. **From HyperCore to HyperEVM**:
   ```
   Send HYPE to: 0x2222222222222222222222222222222222222222
   ```
   This transfers HYPE from HyperCore to your HyperEVM address

2. **From CEX**:
   - Binance, OKX, or Bybit (if HyperEVM withdrawals supported)
   - Withdraw directly to HyperEVM address

### Environment Setup

Create `.env` file in `/Users/ethikotiah/Venicefi/medici-app-final/USDaf-v2-main/contracts/`:

```env
# Deployment Configuration
DEPLOYER=your_private_key_here
SALT=HyperEVM_2025

# HyperEVM RPC
HYPEREVM_RPC_URL=https://rpc.hyperliquid.xyz/evm

# Optional: Use dedicated RPC for production
# HYPEREVM_RPC_URL=https://hyperevm.quicknode.pro/your-api-key
# HYPEREVM_RPC_URL=https://hyperevm.chainstack.com/your-api-key
```

**⚠️ SECURITY**: Never commit `.env` file to git!

---

## Collateral Configuration

### HYPE Branch (Native Token)

**Collateral Parameters**:
```solidity
CCR (Critical Collateral Ratio):     150%  (1.50e18)
MCR (Minimum Collateral Ratio):      120%  (1.20e18)
SCR (Shutdown Collateral Ratio):     110%  (1.10e18)
BCR (Base Collateral Ratio):          10%  (0.10e18)
LIQUIDATION_PENALTY_SP:                5%  (0.05e18)
LIQUIDATION_PENALTY_REDISTRIBUTION:   10%  (0.10e18)
```

**Rationale**:
- **Higher MCR (120%)**: HYPE is more volatile than BTC
- **150% CCR**: Provides safety margin for price volatility
- **110% SCR**: Emergency shutdown threshold

**Token Details**:
- Symbol: HYPE
- Decimals: 18
- Type: Native gas token on HyperEVM
- Contract: N/A (native token, use address(0) or special handling)

### UBTC Branch (Bridged Bitcoin)

**Collateral Parameters**:
```solidity
CCR (Critical Collateral Ratio):     150%  (1.50e18)
MCR (Minimum Collateral Ratio):      110%  (1.10e18)
SCR (Shutdown Collateral Ratio):     105%  (1.05e18)
BCR (Base Collateral Ratio):          10%  (0.10e18)
LIQUIDATION_PENALTY_SP:                5%  (0.05e18)
LIQUIDATION_PENALTY_REDISTRIBUTION:   10%  (0.10e18)
```

**Rationale**:
- **Lower MCR (110%)**: BTC is less volatile, lower risk
- **Consistent with WBTC parameters** on other chains
- **Conservative start**: Can adjust parameters via governance later

**Token Details**:
- Symbol: UBTC
- Decimals: 8 (standard for BTC)
- Type: ERC20 bridged Bitcoin
- Contract: *To be determined* (check HyperEVM ecosystem)

**⚠️ Important**: Verify UBTC contract address exists on HyperEVM before deployment!

---

## Deployment Process

### Step 1: Navigate to Contracts Directory

```bash
cd /Users/ethikotiah/Venicefi/medici-app-final/USDaf-v2-main/contracts
```

### Step 2: Verify Foundry Configuration

Check `foundry.toml` is configured:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
evm_version = 'cancun'
optimizer = true
optimizer_runs = 200

[profile.default.rpc_endpoints]
hyperevm = "${HYPEREVM_RPC_URL}"
```

### Step 3: Test RPC Connection

```bash
# Test connection to HyperEVM
cast block-number --rpc-url $HYPEREVM_RPC_URL

# Check deployer balance
cast balance $DEPLOYER_ADDRESS --rpc-url $HYPEREVM_RPC_URL
```

Expected output:
```
Latest block: 12345678
Deployer balance: 20000000000000000000 (20 HYPE)
```

### Step 4: Create Deployment Script

The deployment script will be based on `DeployCentSepolia.s.sol` but modified for HyperEVM.

**Key Modifications Needed**:

1. **Native HYPE Handling**:
   - HYPE is native token (like ETH)
   - Need special wrapper or direct handling
   - Reference Felix Protocol implementation

2. **UBTC Token**:
   - Verify UBTC contract address on HyperEVM
   - Check decimals (should be 8 for BTC)
   - Verify it's a proper ERC20

3. **Oracle Integration**:
   - For testnet: Use `PriceFeedTestnet` (manual price setting)
   - For production: Use Chainlink oracle on HyperEVM
   - Alternative: HyperCore precompile for native price data

4. **Collateral Parameters**:
   - HYPE: Higher MCR (120%) due to volatility
   - UBTC: Standard BTC MCR (110%)

### Step 5: Dry Run (Simulation)

```bash
# Simulate deployment without broadcasting
forge script script/DeployCentHyperEVM.s.sol \
  --rpc-url $HYPEREVM_RPC_URL \
  --private-key $DEPLOYER \
  --slow

# Review the simulation output carefully!
```

**What to Check**:
- ✅ All contract addresses predicted correctly
- ✅ No revert errors
- ✅ Gas estimates reasonable (<10 HYPE)
- ✅ CREATE2 salt generates unique addresses

### Step 6: Deploy to HyperEVM

**⚠️ CHECKPOINT**: Are you sure you're ready?

- [ ] Private key is secure
- [ ] Deployer has sufficient HYPE
- [ ] RPC connection is stable
- [ ] Simulation succeeded
- [ ] You understand the parameters

```bash
# Deploy contracts (REAL DEPLOYMENT)
forge script script/DeployCentHyperEVM.s.sol \
  --rpc-url $HYPEREVM_RPC_URL \
  --private-key $DEPLOYER \
  --broadcast \
  --verify \
  --slow

# This will:
# 1. Deploy all CENT protocol contracts
# 2. Configure HYPE and UBTC branches
# 3. Generate deployment-manifest.json
# 4. Verify contracts on HyperScan (if supported)
```

**Expected Duration**: 5-15 minutes

### Step 7: Save Deployment Manifest

```bash
# The deployment will create: deployment-manifest.json
# This contains all deployed contract addresses

# Copy to safe location
cp deployment-manifest.json deployment-manifest-hyperevm-$(date +%Y%m%d).json

# View the manifest
cat deployment-manifest.json | jq .
```

**Manifest Structure**:
```json
{
  "collateralRegistry": "0x...",
  "boldToken": "0x...",
  "hintHelpers": "0x...",
  "multiTroveGetter": "0x...",
  "branches": [
    {
      "collSymbol": "HYPE",
      "collToken": "0x0000000000000000000000000000000000000000",
      "borrowerOperations": "0x...",
      "sortedTroves": "0x...",
      "stabilityPool": "0x...",
      "troveManager": "0x...",
      "priceFeed": "0x..."
    },
    {
      "collSymbol": "UBTC",
      "collToken": "0x...",
      "borrowerOperations": "0x...",
      ...
    }
  ]
}
```

---

## Post-Deployment Configuration

### 1. Update Frontend Configuration

Navigate to Medici app root:

```bash
cd /Users/ethikotiah/Venicefi/medici-app-final
```

Update `env.template` and your `.env`:

```env
# HyperEVM CENT Protocol Addresses
VITE_CENT_ADDRESSES_HYPEREVM_JSON='{"boldToken":"0x...","collateralRegistry":"0x...","hintHelpers":"0x...","multiTroveGetter":"0x...","branches":[...]}'
```

**Tip**: Use `jq` to format the JSON properly:
```bash
cat deployment-manifest.json | jq -c . | \
  sed 's/^/VITE_CENT_ADDRESSES_HYPEREVM_JSON=/' > hyperevm-env.txt
```

### 2. Update Token Addresses

Update `src/config/tokens-multichain.ts`:

```typescript
[CHAIN_IDS.HYPEREVM]: {
  HYPE: 'native',
  WHYPE: '0x...', // If wrapper exists
  UBTC: '0x...actual_ubtc_address...',
  // ... other tokens
}
```

### 3. Verify Contract Deployment

```bash
# Check CENT token deployed correctly
cast call <BOLD_TOKEN_ADDRESS> \
  "name()(string)" \
  --rpc-url $HYPEREVM_RPC_URL

# Expected: "Bold"

# Check total supply (should be 0 initially)
cast call <BOLD_TOKEN_ADDRESS> \
  "totalSupply()(uint256)" \
  --rpc-url $HYPEREVM_RPC_URL

# Expected: 0
```

### 4. Set Test Prices (Testnet Only)

If using `PriceFeedTestnet`:

```bash
# Set HYPE price to $10
cast send <HYPE_PRICEFEED_ADDRESS> \
  "setPrice(uint256)" \
  10000000000000000000 \
  --rpc-url $HYPEREVM_RPC_URL \
  --private-key $DEPLOYER

# Set UBTC price to $100,000 (BTC price)
cast send <UBTC_PRICEFEED_ADDRESS> \
  "setPrice(uint256)" \
  100000000000000000000000 \
  --rpc-url $HYPEREVM_RPC_URL \
  --private-key $DEPLOYER
```

### 5. Verify on Block Explorer

Visit HyperScan: https://hyperevmscan.io

Search for:
- ✅ CENT Token (Bold Token)
- ✅ CollateralRegistry
- ✅ HYPE BorrowerOperations
- ✅ UBTC BorrowerOperations

---

## Testing & Verification

### Test 1: Open a Trove (HYPE Collateral)

```bash
# 1. Get HYPE test tokens (if using testnet with faucet)
# For mainnet: You'll need real HYPE

# 2. Approve BorrowerOperations to spend HYPE
# (Skip for native HYPE, send value directly)

# 3. Open Trove
# This would typically be done via frontend or specialized script
```

**Via Frontend**:
1. Connect wallet to HyperEVM
2. Navigate to Borrow page
3. Select HYPE as collateral
4. Enter amount (e.g., 1 HYPE = $10)
5. Borrow CENT (max: $10 / 1.20 = $8.33 at 120% MCR)
6. Confirm transaction

### Test 2: Stability Pool Deposit

1. Deposit CENT to Stability Pool
2. Verify deposit shows in contract
3. Check yield accumulation

### Test 3: Liquidation (if prices drop)

1. Manually trigger price drop (testnet only)
2. Call liquidation on underwater Trove
3. Verify collateral distribution to SP

### Verification Checklist

- [ ] CENT token deployed and accessible
- [ ] CollateralRegistry recognizes both branches
- [ ] HYPE BorrowerOperations accepts deposits
- [ ] UBTC BorrowerOperations accepts deposits
- [ ] Stability Pool accepts CENT deposits
- [ ] Price feeds return reasonable values
- [ ] HintHelpers provides correct hints
- [ ] MultiTroveGetter returns Trove data
- [ ] Frontend can read contract data
- [ ] Transactions successfully execute

---

## Troubleshooting

### Issue: "Insufficient HYPE for gas"

**Solution**:
```bash
# Check balance
cast balance $DEPLOYER_ADDRESS --rpc-url $HYPEREVM_RPC_URL

# If low, transfer more HYPE from HyperCore
# Send to: 0x2222222222222222222222222222222222222222
```

### Issue: "RPC rate limit exceeded"

**Solution**:
```bash
# Use --slow flag to add delays between transactions
forge script ... --slow

# Or switch to dedicated RPC provider
# QuickNode: https://www.quicknode.com/docs/hyperliquid
# Chainstack: https://chainstack.com/hyperliquid-rpc-node/
```

### Issue: "Contract verification failed"

**Solution**:
- HyperScan may not support automatic verification yet
- Manually verify via HyperScan UI
- Upload flattened contract source
- Or skip verification for testnet deployments

### Issue: "UBTC token not found"

**Solution**:
1. Check if UBTC exists on HyperEVM:
   ```bash
   # Search HyperScan for UBTC or Universal Bitcoin
   ```

2. If doesn't exist, deploy only HYPE branch first:
   ```solidity
   // Modify NUM_BRANCHES = 1 in deployment script
   // Deploy only HYPE collateral
   ```

3. Add UBTC branch later when token becomes available

### Issue: "CREATE2 address mismatch"

**Cause**: Salt collision or bytecode mismatch

**Solution**:
```bash
# Change SALT in .env
SALT=HyperEVM_2025_v2

# Re-run simulation
forge script ... --rpc-url $HYPEREVM_RPC_URL
```

### Issue: "Transaction underpriced"

**Solution**:
```bash
# HyperEVM uses EIP-1559 gas pricing
# Increase priority fee:

# In foundry.toml, add:
[profile.default]
gas_price = 1000000000  # 1 gwei
```

---

## Production Deployment Checklist

### Pre-Deployment

- [ ] Audited contracts (use Liquity V2 audits)
- [ ] Test on local fork first
- [ ] Verify all collateral tokens exist
- [ ] Oracle integration confirmed
- [ ] Parameter review complete
- [ ] Emergency shutdown mechanism tested
- [ ] Governance plan in place

### During Deployment

- [ ] Deployer wallet secured (hardware wallet recommended)
- [ ] Sufficient HYPE for gas (20+ HYPE)
- [ ] Stable RPC connection
- [ ] Monitor deployment progress
- [ ] Save all transaction hashes
- [ ] Backup deployment manifest

### Post-Deployment

- [ ] Verify all contracts on block explorer
- [ ] Test all core functions
- [ ] Update frontend configuration
- [ ] Enable monitoring/alerting
- [ ] Document deployment details
- [ ] Announce deployment publicly
- [ ] Set up incident response plan

---

## Cost Breakdown

**Estimated Deployment Costs** (HyperEVM):

| Item | Gas | Cost @ $10/HYPE |
|------|-----|-----------------|
| CENT Token | ~2M gas | ~2 HYPE ($20) |
| CollateralRegistry | ~3M gas | ~3 HYPE ($30) |
| HYPE Branch (7 contracts) | ~10M gas | ~5 HYPE ($50) |
| UBTC Branch (7 contracts) | ~10M gas | ~5 HYPE ($50) |
| Total Estimated | ~25M gas | **~15 HYPE ($150)** |

**Note**: Actual costs depend on:
- Network congestion
- Gas prices at deployment time
- Contract optimization
- Number of branches deployed

**Budget Recommendation**: 20 HYPE ($200) for safety margin

---

## Next Steps After Deployment

1. **Frontend Integration**:
   - Update contract addresses in config
   - Test all CDP operations
   - Add HyperEVM to network switcher

2. **Liquidity Provision**:
   - Create CENT/USDC pool on HyperEVM DEX
   - Provide initial liquidity
   - Enable swaps

3. **Bridge Integration**:
   - Deploy Wormhole token bridge contracts
   - Enable CENT bridging Base ↔ HyperEVM
   - Test cross-chain transfers

4. **Community Launch**:
   - Announce on Twitter/Discord
   - Create tutorial videos
   - Offer initial incentives

5. **Monitoring & Maintenance**:
   - Set up price feed monitoring
   - Monitor system health
   - Prepare for parameter adjustments

---

## Resources

**HyperEVM Documentation**:
- Docs: https://hyperliquid.gitbook.io/hyperliquid-docs/hyperevm
- Explorer: https://hyperevmscan.io
- RPC: https://rpc.hyperliquid.xyz/evm

**Felix Protocol (Reference)**:
- Website: https://usefelix.xyz
- Docs: https://usefelix.gitbook.io/felix-docs
- GitHub: https://github.com/felixprotocol/felix-contracts

**CENT Protocol**:
- Liquity V2 Architecture
- Multi-branch system
- User-set interest rates

**Community Resources**:
- AwesomeHyperEVM: https://github.com/HyperDevCommunity/AwesomeHyperEVM
- Hyperliquid Discord: #builders, #hyperevm channels

---

**Status**: 📋 **Ready for Deployment**
**Confidence**: 🌟🌟🌟🌟 (4/5 stars)
**Risk Level**: 🟡 **MEDIUM** (Production deployment with real funds)

**Recommendation**: Deploy HYPE branch first, verify stability, then add UBTC branch.

---

*Last Updated: 2025-10-26*
*Deployment Guide Version: 1.0*
