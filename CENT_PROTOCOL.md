# CENT Protocol Guide

## Overview

CENT is a Bitcoin-backed stablecoin protocol based on Liquity v2 (Bold). It allows users to:
- **Borrow** CENT stablecoins against Bitcoin collateral
- **Earn** yield by depositing CENT in Stability Pools
- **Set their own** interest rates on borrowed positions

## Protocol Architecture

### Multi-Collateral System

CENT uses a **branch architecture** where each collateral type has its own independent system:

```
CENT Protocol
├── WBTC Branch
│   ├── TroveManager
│   ├── BorrowerOperations
│   ├── StabilityPool
│   └── ActivePool
└── cbBTC Branch
    ├── TroveManager
    ├── BorrowerOperations
    ├── StabilityPool
    └── ActivePool
```

Each branch operates independently with its own:
- Risk parameters (MCR, CCR, SCR)
- Stability pool
- Interest rate market
- Redemption queue

### Core Contracts

| Contract | Purpose |
|----------|---------|
| **BorrowerOperations** | User interface for opening/adjusting/closing positions |
| **TroveManager** | Manages liquidations, redemptions, and trove state |
| **StabilityPool** | Accepts CENT deposits, distributes liquidation gains + yield |
| **CollateralRegistry** | Routes redemptions across branches |
| **BOLDToken** | The CENT stablecoin (ERC20) |
| **SortedTroves** | Maintains troves sorted by interest rate |

## Key Concepts

### 1. Troves (Borrowing Positions)

A **Trove** is your borrowing position - it's actually an NFT that contains:

```typescript
{
  collateral: bigint,        // Amount of BTC collateral
  debt: bigint,              // Amount of CENT borrowed
  annualInterestRate: bigint, // Your chosen interest rate (in basis points)
  lastInterestRateAdjTime: bigint, // When you last changed your rate
}
```

**Key Features:**
- **NFT-based**: You can transfer ownership of your trove
- **Multiple positions**: You can have multiple troves per collateral type
- **User-set rates**: You choose your own interest rate
- **Simple interest**: Interest accrues continuously but compounds only when the trove is "touched"

**Minimum Requirements:**
- Minimum debt: ~200 CENT
- Minimum Collateral Ratio (MCR): Varies by collateral (typically 110-120%)

### 2. Interest Rates

Unlike traditional lending protocols, **borrowers choose their own interest rate**.

**How it works:**
```
Lower Rate = More redemption risk
Higher Rate = Less redemption risk + Higher borrowing cost
```

**Interest Rate Mechanics:**
- Rates can be 0.5% - 100% annual
- Interest is **simple** (non-compounding) and accrues continuously
- Rate changes have a **7-day cooldown** (or pay a 1-week interest fee)
- Lower-rate troves get redeemed first

**Strategic Considerations:**
- Set rate too low → Risk of redemption
- Set rate too high → Pay more interest than necessary
- Monitor redemption activity to adjust strategically

### 3. Stability Pool

The Stability Pool is a **pool of CENT** that earns yield from:

#### Sources of Yield:
1. **Liquidation Gains**: Receive collateral at discount from liquidated troves
2. **Interest Yield**: Earn portion of interest paid by borrowers

```typescript
// Example returns:
Deposit: 10,000 CENT
↓
After liquidations: 9,800 CENT + 0.015 BTC
After 1 year: 10,200 CENT + 0.020 BTC + 500 CENT interest
```

**How Liquidations Work:**
- Unhealthy troves (ICR < MCR) get liquidated
- Stability pool absorbs the debt
- Depositors receive the collateral pro-rata
- Pool deposits may decrease but gain collateral

**Claiming Gains:**
- Collateral gains can be claimed separately
- Yield gains can be compounded back into deposit
- No lock-up period - withdraw anytime

### 4. Redemptions

Redemption allows anyone to exchange **1 CENT for $1 worth of collateral** (minus fees).

**How Redemptions Work:**

```
User sends: 1,000 CENT
↓
System finds lowest-rate troves
↓
User receives: ~$1,000 worth of BTC (minus redemption fee)
↓
Affected troves: Debt reduced, collateral reduced
```

**Redemption Ordering:**
1. Routes across branches based on "unbackedness" ratio
2. Within each branch, hits lowest interest rate troves first
3. Troves can become "Zombies" if debt falls below minimum

**Protection from Redemptions:**
- Set higher interest rate
- Monitor redemption activity
- Keep collateral ratio high
- Use batch delegation for automatic rate management

### 5. Liquidations

Troves become liquidatable when their **Individual Collateral Ratio (ICR) < MCR**.

```typescript
ICR = (Collateral Value / Total Debt) × 100

Example:
Collateral: 1 BTC at $100,000
Debt: 80,000 CENT
ICR = (100,000 / 80,000) × 100 = 125%

If MCR = 110%, this trove is safe
If price drops to $85,000:
ICR = (85,000 / 80,000) × 100 = 106% → LIQUIDATABLE
```

**Liquidation Process:**
1. Stability Pool absorbs debt if it has capacity
2. Remaining debt redistributes to active troves
3. Liquidator receives gas compensation + collateral bonus

## Using CENT in Medici

### Borrowing (Opening a Trove)

**src/pages/Borrow.tsx**

```typescript
// 1. Choose collateral (WBTC or cbBTC)
// 2. Deposit collateral amount
// 3. Set desired interest rate
// 4. Borrow CENT (must maintain MCR)

const openTrove = async (collAmount, debtAmount, interestRate) => {
  // Interest rate in basis points (5% = 500)
  await borrowerOperations.openTrove(
    owner,
    ownerIndex,
    collAmount,
    debtAmount,
    upperHint,
    lowerHint,
    interestRate,
    maxUpfrontFee
  )
}
```

**Best Practices:**
- Start with moderate interest rate (3-5%)
- Maintain healthy collateral ratio (150%+)
- Monitor your position regularly
- Plan for interest rate adjustments

### Earning (Stability Pool)

**src/pages/Earn.tsx**

```typescript
// 1. Approve CENT token
// 2. Deposit to stability pool
// 3. Earn liquidation gains + interest yield

const depositToSP = async (amount) => {
  await stabilityPool.provideToSP(amount)
}

// Claim gains
const claimGains = async () => {
  await stabilityPool.withdrawFromSP(0, true) // 0 = no withdrawal, true = claim gains
}
```

**Returns:**
- APR from interest: Variable (depends on total borrowing)
- Liquidation gains: Variable (depends on liquidation frequency)
- Risk: Deposit can decrease during liquidations but gains collateral

### Adjusting Your Trove

**Adjusting Interest Rate:**

```typescript
// Check cooldown first
const lastAdjTime = trove.lastInterestRateAdjTime
const cooldownPeriod = 7 * 24 * 60 * 60 // 7 days
const canAdjustFree = Date.now() > lastAdjTime + cooldownPeriod

// Adjust rate
await borrowerOperations.adjustTroveInterestRate(
  troveId,
  newInterestRate,
  upperHint,
  lowerHint
)
// Fee: Free if > 7 days, otherwise 1 week of average interest
```

**Adding Collateral / Paying Debt:**

```typescript
// Add collateral
await borrowerOperations.addColl(troveId, collAmount)

// Repay debt
await borrowerOperations.repayBold(troveId, debtAmount)

// Withdraw collateral (if maintaining MCR)
await borrowerOperations.withdrawColl(troveId, collAmount)

// Borrow more (if maintaining MCR)
await borrowerOperations.withdrawBold(troveId, debtAmount, maxUpfrontFee)
```

## Advanced Features

### Batch Delegation

Batch managers can manage interest rates for multiple troves efficiently:

**Benefits:**
- Lower gas costs for rate adjustments
- Professional rate optimization
- Automated redemption protection

**How to Use:**
```typescript
// Join a batch
await borrowerOperations.addTroveToBatch(
  troveId,
  batchAddress
)

// Batch manager adjusts rates for all troves
```

### Trove NFTs

Troves are ERC721 NFTs - you can:
- Transfer ownership
- List on NFT marketplaces
- Use as collateral in other protocols
- Hold multiple positions

### Hints System

The protocol uses a sorted linked list for efficiency. When interacting, you need to provide "hints" (adjacent trove positions):

```typescript
// Get hints from HintHelpers
const {
  upperHint,
  lowerHint,
  upperHintApproxAddress,
  lowerHintApproxAddress
} = await hintHelpers.getApproxHint(
  nominalICR,
  numTrials,
  inputRandomSeed
)
```

Medici handles hint calculation automatically in the background.

## Risk Parameters

### WBTC Branch
- **MCR**: 110% (Minimum Collateral Ratio)
- **CCR**: 150% (Critical Collateral Ratio for recovery mode)
- **Liquidation Penalty**: ~10%
- **Borrowing Fee**: Based on upfront interest period

### cbBTC Branch
- **MCR**: 110%
- **CCR**: 150%
- **Liquidation Penalty**: ~10%
- **Borrowing Fee**: Based on upfront interest period

## Economic Model

### Stability Pool Returns

```
Total Yield = Interest Yield + Liquidation Gains

Interest Yield:
- Portion of all interest paid by borrowers
- Distributed pro-rata to depositors
- Continuous accrual

Liquidation Gains:
- Receive collateral from liquidated troves
- At ~10% discount to market price
- May reduce deposit amount but gain collateral value
```

### Interest Rate Market

The protocol creates a **market for interest rates**:

```
High Redemption Activity
↓
Borrowers increase rates to avoid redemptions
↓
Average rate increases
↓
Redemption fee increases
↓
Redemption activity slows
↓
Rates stabilize
```

## Monitoring Your Position

### Key Metrics to Watch

**Collateral Ratio**:
```typescript
CR = (Collateral Value × BTC Price) / (Debt + Accrued Interest) × 100

Safe: > 150%
Caution: 120-150%
Danger: < 120%
Liquidation: < 110% (MCR)
```

**Interest Rate Position**:
```typescript
// How much debt is ahead of you in redemption queue?
DebtAheadInRedemptionQueue =
  Sum of all debt with interest rate < your rate

Low debt ahead = Higher redemption risk
High debt ahead = Lower redemption risk
```

**Accrued Interest**:
```typescript
AccruedInterest =
  PrincipalDebt × AnnualRate × (TimeSinceLastUpdate / 1 year)
```

### Dashboard Integration

Medici shows all key metrics on the Overview page:

```typescript
// src/pages/Overview.tsx
- Total collateral value
- Total debt (including accrued interest)
- Current collateral ratio
- Annual interest rate
- Stability pool deposits
- Claimable gains
```

## Best Practices

### For Borrowers

1. **Start Conservative**
   - Higher collateral ratio (150-200%)
   - Moderate interest rate (3-5%)
   - Monitor regularly

2. **Interest Rate Strategy**
   - Check redemption activity weekly
   - Adjust rates strategically (respecting 7-day cooldown)
   - Use batch delegation for automatic optimization

3. **Risk Management**
   - Set price alerts for your liquidation price
   - Keep buffer above MCR
   - Plan for rate increases during high redemption periods

4. **Gas Optimization**
   - Batch operations when possible
   - Consider batch delegation for frequent adjustments
   - Time non-urgent operations for low gas periods

### For Stability Pool Depositors

1. **Understand the Trade-off**
   - Deposit amount may decrease
   - But you gain valuable collateral
   - Net effect depends on liquidation discount

2. **Diversify**
   - Consider deposits across multiple branches
   - Don't put all capital in one pool

3. **Claim Strategy**
   - Claim collateral gains regularly
   - Compound yield gains for better returns
   - Monitor gas costs vs. gain amounts

## Integration with Bridge Banking

Medici uniquely combines CENT protocol with Bridge.xyz banking:

```
Bitcoin Collateral
↓
Borrow CENT
↓
Bridge On-Ramp: CENT → USD
↓
Real bank account with routing number
↓
Spend with virtual debit card
```

This creates a complete **Bitcoin banking experience**:
- Borrow against Bitcoin (CENT protocol)
- Convert to fiat (Bridge on-ramp)
- Spend anywhere (Bridge cards)
- Cash out easily (Bridge off-ramp)

See [BRIDGE_SETUP.md](./BRIDGE_SETUP.md) for banking integration details.

## Resources

- **Liquity v2 Docs**: https://github.com/liquity/bold
- **Interest Rate Management**: https://github.com/liquity/bold-ir-management
- **CENT Contracts**: See `src/config/cent.ts` for deployed addresses
- **Original Liquity**: https://liquity.org

## FAQ

**Q: What happens if I get redeemed?**
A: Your debt and collateral decrease proportionally. Your CR stays the same. You pay the redemption fee. If debt falls below 200 CENT, your trove becomes a "Zombie."

**Q: Can I lose money in the Stability Pool?**
A: Your CENT deposit can decrease, but you receive collateral. Net P&L depends on whether collateral value exceeds lost deposit value.

**Q: How often should I adjust my interest rate?**
A: Only when needed - there's a 7-day cooldown or you pay a fee. Monitor redemption activity weekly.

**Q: What's the optimal interest rate?**
A: It depends on redemption activity. Generally 2-5% is competitive. Higher during high redemption periods.

**Q: Can I have multiple troves?**
A: Yes! Each trove is an NFT. You can have multiple positions with different strategies.

**Q: What if my collateral is liquidated?**
A: You lose your collateral and your debt is cleared. Try to maintain CR > 150% to avoid this.

**Q: How do I calculate my liquidation price?**
A: `LiquidationPrice = (Debt × MCR) / CollateralAmount`

Example: 80,000 CENT debt, 1 BTC, MCR = 110%
Liquidation Price = (80,000 × 1.1) / 1 = $88,000

---

**Need Help?**
- Check the Overview page for real-time position data
- Monitor your collateral ratio daily
- Join the community for strategy discussions
