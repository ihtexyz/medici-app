# HyperEVM Deployment Scripts

This directory contains configuration and documentation for deploying CENT Protocol to HyperEVM (Hyperliquid).

---

## Quick Start

### Prerequisites

1. **Install Foundry** (if not already installed):
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Get HYPE tokens**:
   - Minimum 20 HYPE for deployment
   - Transfer from HyperCore: Send to `0x2222222222222222222222222222222222222222`

3. **Set up environment**:
   ```bash
   cd /Users/ethikotiah/Venicefi/medici-app-final/USDaf-v2-main/contracts
   cp .env.example .env
   # Edit .env and add your DEPLOYER private key
   ```

### Deploy

```bash
# 1. Navigate to contracts directory
cd /Users/ethikotiah/Venicefi/medici-app-final/USDaf-v2-main/contracts

# 2. Test connection
forge script script/DeployCentHyperEVM.s.sol --rpc-url $HYPEREVM_RPC_URL

# 3. Deploy (when ready)
forge script script/DeployCentHyperEVM.s.sol \
  --rpc-url $HYPEREVM_RPC_URL \
  --broadcast \
  --verify \
  --slow
```

### Post-Deployment

```bash
# 1. Save deployment manifest
cp deployment-manifest.json ../../../scripts/deploy/hyperevm-deployment-$(date +%Y%m%d).json

# 2. Update frontend configuration
# Copy addresses from deployment-manifest.json to .env file

# 3. Test deployment
# Open Trove via frontend or CLI
```

---

## Files

| File | Purpose |
|------|---------|
| `hyperevm-config.json` | Collateral parameters and deployment configuration |
| `README.md` | This file - quick start guide |

---

## Documentation

### Full Deployment Guide

See: `/Users/ethikotiah/Venicefi/medici-app-final/HYPEREVM_DEPLOYMENT_GUIDE.md`

**Sections**:
- Prerequisites
- Collateral Configuration (HYPE, UBTC parameters)
- Step-by-step Deployment Process
- Post-Deployment Configuration
- Testing & Verification
- Troubleshooting

### Integration Analysis

See: `/Users/ethikotiah/Venicefi/medici-app-final/HYPEREVM_BASE_INTEGRATION_ANALYSIS.md`

**Sections**:
- HyperEVM Technical Analysis
- Felix Protocol Comparison
- Deployment Feasibility
- Integration Architecture
- Implementation Roadmap
- Cost Analysis
- Risk Assessment

---

## Collateral Parameters

### HYPE (Native Token)

```json
{
  "CCR": "150%",  // Critical Collateral Ratio
  "MCR": "120%",  // Minimum Collateral Ratio
  "SCR": "110%",  // Shutdown Collateral Ratio
  "LIQUIDATION_PENALTY_SP": "5%",
  "LIQUIDATION_PENALTY_REDISTRIBUTION": "10%"
}
```

**Rationale**: Higher MCR (120%) due to HYPE volatility

### UBTC (Bridged Bitcoin)

```json
{
  "CCR": "150%",
  "MCR": "110%",  // Lower MCR - BTC less volatile
  "SCR": "105%",
  "LIQUIDATION_PENALTY_SP": "5%",
  "LIQUIDATION_PENALTY_REDISTRIBUTION": "10%"
}
```

**Rationale**: Standard BTC parameters, consistent with WBTC

---

## Deployment Checklist

### Pre-Deployment
- [ ] Read full deployment guide
- [ ] Verify HYPE balance (20+ HYPE)
- [ ] Set DEPLOYER in .env
- [ ] Test RPC connection
- [ ] Review collateral parameters
- [ ] Understand risks

### Deployment
- [ ] Run simulation first (--rpc-url, no --broadcast)
- [ ] Review simulation output
- [ ] Deploy with --broadcast --verify --slow
- [ ] Monitor transaction status
- [ ] Save all transaction hashes

### Post-Deployment
- [ ] Verify deployment manifest created
- [ ] Backup deployment manifest
- [ ] Update frontend .env file
- [ ] Verify contracts on HyperScan
- [ ] Set test prices (if using testnet oracles)
- [ ] Test basic operations

---

## Cost Estimate

| Item | Gas | Cost @ $10/HYPE |
|------|-----|-----------------|
| CENT Token | ~2M | ~2 HYPE ($20) |
| CollateralRegistry | ~3M | ~3 HYPE ($30) |
| HYPE Branch | ~10M | ~5 HYPE ($50) |
| UBTC Branch | ~10M | ~5 HYPE ($50) |
| **Total** | **~25M** | **~15 HYPE ($150)** |

**Recommended budget**: 20 HYPE ($200) for safety margin

---

## Troubleshooting

### Common Issues

**"Insufficient HYPE for gas"**
```bash
# Check balance
cast balance $DEPLOYER_ADDRESS --rpc-url https://rpc.hyperliquid.xyz/evm

# Get more HYPE from HyperCore
```

**"RPC rate limit exceeded"**
```bash
# Use --slow flag
forge script ... --slow

# Or use dedicated RPC (QuickNode, Chainstack)
```

**"Contract verification failed"**
```bash
# HyperScan may not support auto-verification
# Manually verify via UI
# Or skip for testnet: remove --verify flag
```

---

## Resources

**HyperEVM**:
- Docs: https://hyperliquid.gitbook.io/hyperliquid-docs/hyperevm
- Explorer: https://hyperevmscan.io
- RPC: https://rpc.hyperliquid.xyz/evm
- Awesome: https://github.com/HyperDevCommunity/AwesomeHyperEVM

**Felix Protocol (Reference)**:
- Website: https://usefelix.xyz
- Docs: https://usefelix.gitbook.io/felix-docs
- GitHub: https://github.com/felixprotocol/felix-contracts
- Status: Live with $100M+ TVL ✅

**CENT Protocol**:
- Based on Liquity V2 architecture
- Multi-collateral branch system
- User-set interest rates
- NFT-based Troves

---

## Support

**Discord**: Find us in #builders or #hyperevm
**GitHub**: https://github.com/venicefi/medici-app
**Docs**: See HYPEREVM_DEPLOYMENT_GUIDE.md

---

**Status**: 📋 **Ready for Deployment**

The CENT protocol is proven technology (Liquity V2) and Felix Protocol has already validated the deployment path on HyperEVM. You're ready to proceed!

---

*Last Updated: 2025-10-26*
