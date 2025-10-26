# Internet Computer Protocol (ICP) Integration Guide

## Overview

Medici will integrate with Internet Computer Protocol to enable **native Bitcoin support** through Chain-Key Bitcoin (ckBTC), providing a truly decentralized Bitcoin banking experience without traditional bridges.

## Why ICP + ckBTC?

### Traditional Wrapped Bitcoin Limitations
- **Centralized bridges** - Single point of failure
- **Custodial risk** - Trust in bridge operators
- **High fees** - Bridge operators charge premiums
- **Slow settlements** - Multiple network hops

### ckBTC Advantages
- ✅ **No bridge** - Direct protocol-level integration
- ✅ **1:1 Bitcoin backing** - Each ckBTC backed by real BTC
- ✅ **Fast transactions** - Finalized in 2 seconds
- ✅ **Low fees** - ~$0.0001 per transaction (vs $5-50 on Bitcoin)
- ✅ **Fully decentralized** - No central custody
- ✅ **ICRC-1/ICRC-2 compliant** - Standard token interface

## Architecture

### How ckBTC Works

```
Bitcoin Network
      ↓
   (Deposit)
      ↓
┌─────────────────────────┐
│  ckBTC Minter Canister  │ ← Threshold ECDSA signing
│  (Controls BTC address) │
└─────────────────────────┘
      ↓
   (Mint)
      ↓
┌─────────────────────────┐
│  ckBTC Ledger Canister  │ ← ICRC-1 token standard
│  (Token balances)       │
└─────────────────────────┘
      ↓
  (Transfer)
      ↓
┌─────────────────────────┐
│   User's ICP Wallet     │
└─────────────────────────┘
```

### Key Components

**1. ckBTC Minter Canister**
- Controls Bitcoin addresses via threshold ECDSA
- Monitors Bitcoin network for deposits
- Mints ckBTC when BTC received
- Burns ckBTC and releases BTC on withdrawals

**2. ckBTC Ledger Canister**
- Maintains account balances
- Processes transfers (ICRC-1 standard)
- Records transaction history
- Handles approvals (ICRC-2 standard)

**3. Bitcoin Integration**
- Direct API access to Bitcoin network
- Queries UTXOs and balances
- Submits transactions
- No oracle required

## Integration Strategy for Medici

### Phase 1: Add ckBTC as Collateral

```typescript
// src/config/cent.ts - Add ckBTC branch

export const CENT_ADDRESSES = {
  ...existing,
  branches: [
    {
      collSymbol: "WBTC18",
      // ... existing
    },
    {
      collSymbol: "cbBTC18",
      // ... existing
    },
    {
      collSymbol: "ckBTC",  // ← New ICP chain-key Bitcoin
      collToken: "0x...",  // ckBTC contract on Arbitrum (via bridge)
      borrowerOperations: "0x...",
      troveManager: "0x...",
      stabilityPool: "0x...",
      sortedTroves: "0x...",
      priceFeed: "0x...",
    }
  ]
}
```

### Phase 2: Direct ICP Integration

```
User Flow:
1. User has native Bitcoin
2. Sends BTC to ICP address
3. Receives ckBTC instantly
4. Bridges ckBTC to Arbitrum (if needed)
5. Uses as collateral in Medici
```

### Phase 3: ICP Canister Deployment

Deploy Medici as ICP canister for native ckBTC integration:

```
┌──────────────────────────────────────────┐
│  Medici ICP Canister                     │
│  - Frontend (React/TypeScript)           │
│  - Backend (Motoko/Rust)                 │
│  - Direct ckBTC integration              │
│  - CENT protocol interaction             │
└──────────────────────────────────────────┘
         ↓                    ↓
    ckBTC Ledger      CENT Protocol (Arbitrum)
```

## Technical Implementation

### 1. ckBTC Token Interface (ICRC-1)

```typescript
// Standard ICRC-1 methods
interface ICRC1 {
  // Get balance
  icrc1_balance_of(account: Account): Nat;

  // Transfer tokens
  icrc1_transfer(args: TransferArgs): TransferResult;

  // Get metadata
  icrc1_metadata(): MetaData[];

  // Get token info
  icrc1_name(): Text;
  icrc1_symbol(): Text;
  icrc1_decimals(): Nat8;
  icrc1_fee(): Nat;
  icrc1_total_supply(): Nat;
}
```

### 2. ckBTC Minter Interface

```typescript
interface CkBTCMinter {
  // Get deposit address for user
  get_btc_address(account: Account): Text;

  // Get withdrawal account
  get_withdrawal_account(): Account;

  // Request withdrawal
  retrieve_btc(args: RetrieveBtcArgs): RetrieveBtcOk;

  // Update balance (check for new deposits)
  update_balance(account: Account): UpdateBalanceResult;
}
```

### 3. Integration in Medici

**src/services/ckbtc.ts** (new file)

```typescript
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// Canister IDs (mainnet)
const CKBTC_MINTER_CANISTER = 'mqygn-kiaaa-aaaar-qaadq-cai';
const CKBTC_LEDGER_CANISTER = 'mxzaz-hqaaa-aaaar-qaada-cai';

export class CkBTCService {
  private agent: HttpAgent;

  constructor(identity: any) {
    this.agent = new HttpAgent({
      identity,
      host: 'https://ic0.app',
    });
  }

  async getBalance(principal: Principal): Promise<bigint> {
    const actor = Actor.createActor(ledgerIdl, {
      agent: this.agent,
      canisterId: CKBTC_LEDGER_CANISTER,
    });

    return await actor.icrc1_balance_of({
      owner: principal,
      subaccount: [],
    });
  }

  async transfer(to: Principal, amount: bigint): Promise<any> {
    const actor = Actor.createActor(ledgerIdl, {
      agent: this.agent,
      canisterId: CKBTC_LEDGER_CANISTER,
    });

    return await actor.icrc1_transfer({
      to: { owner: to, subaccount: [] },
      amount,
      fee: [],
      memo: [],
      created_at_time: [],
      from_subaccount: [],
    });
  }

  async getDepositAddress(principal: Principal): Promise<string> {
    const actor = Actor.createActor(minterIdl, {
      agent: this.agent,
      canisterId: CKBTC_MINTER_CANISTER,
    });

    return await actor.get_btc_address({
      owner: principal,
      subaccount: [],
    });
  }

  async withdrawBTC(address: string, amount: bigint): Promise<any> {
    const actor = Actor.createActor(minterIdl, {
      agent: this.agent,
      canisterId: CKBTC_MINTER_CANISTER,
    });

    return await actor.retrieve_btc({
      address,
      amount,
    });
  }
}
```

## User Flows

### Flow 1: Deposit Bitcoin → Get ckBTC

```
1. User clicks "Deposit Bitcoin" in Medici
2. App generates unique BTC address via ckBTC minter
3. User sends BTC to that address
4. ckBTC minter monitors Bitcoin network (6 confirmations)
5. ckBTC automatically minted to user's ICP account
6. User sees ckBTC balance in Medici

Timeline: ~60 minutes (Bitcoin confirmation time)
Fee: Bitcoin network fee only (~$5-20)
```

### Flow 2: Use ckBTC as Collateral

```
1. User has ckBTC in ICP wallet
2. Bridges ckBTC to Arbitrum (if using CENT on Arbitrum)
   OR uses native ICP if Medici deployed as canister
3. Approves ckBTC for CENT protocol
4. Opens Trove with ckBTC collateral
5. Borrows CENT stablecoin
6. Earns yield in Stability Pool

Benefits:
- True Bitcoin ownership (not wrapped)
- No custodial risk
- Fast & cheap transactions
```

### Flow 3: Withdraw ckBTC → Get Bitcoin

```
1. User has ckBTC in Medici
2. Clicks "Withdraw to Bitcoin"
3. Enters Bitcoin address
4. Confirms withdrawal
5. ckBTC burned from balance
6. BTC sent to specified address

Timeline: ~10 minutes
Fee: Bitcoin network fee + 0.0000001 ckBTC
```

## ICP Canister Architecture (Future)

### Option A: Hybrid Approach
```
Frontend: Vercel/Netlify (current)
Backend: ICP Canisters
Blockchain: Arbitrum (CENT protocol)
Bitcoin: ICP ckBTC integration
```

### Option B: Full ICP Deployment
```
Frontend: ICP Canister (static assets)
Backend: ICP Canister (Rust/Motoko)
Smart Contracts: ICP Canisters
Bitcoin: Native ckBTC
Bridge to Arbitrum: For CENT protocol
```

## Development Roadmap

### Phase 1: Research & Planning (Current)
- ✅ Study ICP architecture
- ✅ Understand ckBTC mechanics
- ✅ Plan integration strategy
- ⏳ Set up ICP development environment

### Phase 2: Basic Integration (2-3 weeks)
- [ ] Install ICP SDK (`dfx`)
- [ ] Create ICP identity
- [ ] Test ckBTC on testnet
- [ ] Build ckBTC deposit/withdrawal flow
- [ ] Add ckBTC balance display

### Phase 3: Collateral Integration (3-4 weeks)
- [ ] Deploy ckBTC bridge to Arbitrum (or use existing)
- [ ] Add ckBTC as collateral type in CENT
- [ ] Update UI to support ckBTC branch
- [ ] Test full borrow → earn cycle

### Phase 4: Full ICP Deployment (8-12 weeks)
- [ ] Build Medici as ICP canister
- [ ] Migrate frontend to canister
- [ ] Implement backend logic in Rust/Motoko
- [ ] Set up Internet Identity integration
- [ ] Deploy to mainnet

## Required Tools & Resources

### Development Tools
```bash
# Install dfx (ICP SDK)
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Install Node.js dependencies
npm install @dfinity/agent @dfinity/principal @dfinity/identity
```

### Key Resources
- **ICP SDK Documentation**: https://internetcomputer.org/docs/current/developer-docs/getting-started/install
- **ckBTC Documentation**: https://internetcomputer.org/docs/current/developer-docs/integrations/bitcoin/ckbtc
- **ICRC-1 Standard**: https://github.com/dfinity/ICRC-1
- **Bitcoin Integration**: https://internetcomputer.org/bitcoin-integration

### Canister IDs (Mainnet)

| Canister | ID | Purpose |
|----------|----|---------|
| ckBTC Ledger | `mxzaz-hqaaa-aaaar-qaada-cai` | Token balances |
| ckBTC Minter | `mqygn-kiaaa-aaaar-qaadq-cai` | BTC ↔ ckBTC conversion |
| ckBTC Index | `n5wcd-faaaa-aaaar-qaaea-cai` | Transaction history |

## Cost Analysis

### Current Setup (WBTC/cbBTC on Arbitrum)
- Gas per transaction: ~$0.10-1.00
- Bridge fees: 0.2-0.5%
- Trust assumption: Centralized bridges

### With ckBTC Integration
- Transaction fee: ~$0.0001 (on ICP)
- Bridge to Arbitrum: ~$0.10 (one-time)
- BTC deposit: Bitcoin network fee ($5-20)
- BTC withdrawal: Bitcoin network fee ($5-20)
- Trust assumption: Fully decentralized

## Security Considerations

### ckBTC Security Model
- **Threshold ECDSA**: Bitcoin keys controlled by subnet consensus
- **No single point of failure**: Keys split across 28+ nodes
- **Chain-key cryptography**: Industry-leading security
- **Audit history**: Thoroughly audited by Trail of Bits

### Integration Security
- **API calls**: Use certified queries for balance checks
- **Transaction signing**: Require explicit user approval
- **Address generation**: Validate BTC addresses before withdrawal
- **Amount validation**: Check sufficient balance + fees

## Testing Strategy

### Testnet Testing
```typescript
// Use ckBTC testnet faucet
const TESTNET_MINTER = 'mc6ru-gyaaa-aaaar-qaaaq-cai';
const TESTNET_LEDGER = 'ml52i-qqaaa-aaaar-qaaba-cai';

// Get testnet BTC
// Visit: https://testnet.dfinity.network
```

### Integration Tests
1. ✅ Deposit Bitcoin → Receive ckBTC
2. ✅ Transfer ckBTC between accounts
3. ✅ Approve ckBTC for protocol
4. ✅ Use as collateral
5. ✅ Withdraw ckBTC → Bitcoin

## Performance Benchmarks

### Target Metrics
- ckBTC balance fetch: < 100ms
- ckBTC transfer: < 2 seconds (finality)
- Bitcoin deposit detection: < 60 minutes (6 confirmations)
- Bitcoin withdrawal: < 10 minutes

### Comparison
| Metric | ckBTC | WBTC | cbBTC |
|--------|-------|------|-------|
| Transfer Speed | 2s | 12s | 12s |
| Transfer Fee | $0.0001 | $0.50 | $0.50 |
| Bridge Risk | None | High | Medium |
| Decentralization | Full | Low | Medium |

## Next Steps

1. **Immediate** (This Sprint)
   - Set up ICP development environment
   - Deploy test canister
   - Test ckBTC on testnet

2. **Short-term** (Next Month)
   - Build ckBTC deposit/withdrawal UI
   - Integrate with existing Medici frontend
   - Add ckBTC balance display

3. **Medium-term** (Next Quarter)
   - Deploy ckBTC as collateral option
   - Full testing on testnet
   - Mainnet deployment

4. **Long-term** (6-12 Months)
   - Migrate Medici to ICP canister
   - Full native Bitcoin integration
   - Remove dependency on bridges

## Support & Resources

- **ICP Developer Forum**: https://forum.dfinity.org
- **ICP Discord**: https://discord.gg/internetcomputer
- **ckBTC Support**: https://support.dfinity.org

---

**Status**: Planning Phase
**Priority**: High - Enables true Bitcoin banking
**Estimated Effort**: 2-3 months for full integration
**Expected Impact**: Significant - Removes bridge risk, reduces fees, improves UX
