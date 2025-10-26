# Medici User Guide

Welcome to Medici - Simple Bitcoin Banking! This guide will help you understand how to use all features of the Medici app.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Borrowing (Opening a Trove)](#borrowing-opening-a-trove)
3. [Managing Your Trove](#managing-your-trove)
4. [Earning Yield (Stability Pool)](#earning-yield-stability-pool)
5. [Redeeming CENT](#redeeming-cent)
6. [Using the Leverage Calculator](#using-the-leverage-calculator)
7. [Understanding Governance](#understanding-governance)
8. [Rewards Program](#rewards-program)
9. [Safety and Best Practices](#safety-and-best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What is Medici?

Medici is a decentralized borrowing protocol that lets you use your Bitcoin (WBTC, cbBTC) as collateral to borrow CENT stablecoin. You can also earn yield by depositing CENT into the Stability Pool.

### Prerequisites

**You'll need:**
1. **A Web3 Wallet** - MetaMask, Coinbase Wallet, or WalletConnect compatible
2. **Supported Collateral** - WBTC18 or cbBTC18
3. **Test tokens** - Use the faucet on testnet to get tokens
4. **Some ETH** - For gas fees

### Connecting Your Wallet

1. Click **"Connect Wallet"** button
2. Select your wallet provider
3. Approve the connection
4. Switch to Base Sepolia network if prompted
5. You're ready to use Medici!

---

## Borrowing (Opening a Trove)

A "Trove" is your borrowing position - it holds your collateral and tracks your debt.

### Step 1: Navigate to Borrow Page

Click **"Borrow"** in the navigation menu.

### Step 2: Choose Your Collateral

Select the type of Bitcoin collateral you want to use:
- **WBTC18** - Wrapped Bitcoin (18 decimals)
- **cbBTC18** - Coinbase Wrapped Bitcoin (18 decimals)

### Step 3: Enter Collateral Amount

**Example:**
```
Collateral: 1.0 WBTC18
Current Price: $67,500
Collateral Value: $67,500
```

### Step 4: Set Your Interest Rate

Choose an annual interest rate between **0.5% - 25%**

**How to choose:**
- **Lower rates (0.5% - 2%)**: Cheaper borrowing, but higher redemption risk
- **Medium rates (2% - 5%)**: Balanced approach
- **Higher rates (5%+)**: More expensive, but better redemption protection

**💡 Tip**: Start with 5% for a good balance of cost and protection.

### Step 5: Enter Debt Amount

Decide how much CENT you want to borrow.

**Important Limits:**
- **Minimum debt**: 2,000 CENT
- **Collateral Ratio (CR) must be ≥ 120%** (150%+ recommended)

**Formula:**
```
Collateral Ratio = (Collateral Value / Debt Value) × 100

Example:
Collateral: 1.0 WBTC at $67,500 = $67,500
Debt: 40,000 CENT = $40,000
CR = ($67,500 / $40,000) × 100 = 168.75%  ✅ Healthy
```

### Step 6: Review and Confirm

Check your position summary:
- ✅ Collateral amount and value
- ✅ CENT to be minted
- ✅ Collateral Ratio (should be ≥ 150%)
- ✅ Interest rate
- ✅ Upfront fee

### Step 7: Approve and Open

1. Click **"Approve Collateral"** (one-time approval)
2. Confirm in your wallet
3. Click **"Open Trove"**
4. Confirm the transaction
5. Wait for confirmation (~15 seconds)

**🎉 Success!** Your Trove is now open, and CENT is in your wallet.

---

## Managing Your Trove

### Viewing Your Position

Navigate to **"Borrow"** to see your Trove details:
- Current collateral amount
- Current debt
- Collateral Ratio
- Interest accrued
- Liquidation price

### Adding Collateral

**Why?** Increase your CR for safety or borrow more CENT

1. Go to **"Manage Trove"** tab
2. Click **"Add Collateral"**
3. Enter amount to add
4. Review new CR
5. Confirm transaction

### Withdrawing Collateral

**⚠️ Warning**: Only withdraw if your CR stays above 150%

1. Go to **"Manage Trove"** tab
2. Click **"Withdraw Collateral"**
3. Enter amount to withdraw
4. Check new CR (must be ≥ 120%)
5. Confirm transaction

### Borrowing More CENT

**Requirement**: CR must remain ≥ 120% (150%+ recommended)

1. Go to **"Manage Trove"** tab
2. Click **"Borrow More"**
3. Enter additional CENT amount
4. Review new CR
5. Set max upfront fee (slippage protection)
6. Confirm transaction

### Repaying Debt

**Benefit**: Increases your CR and reduces interest payments

1. Go to **"Manage Trove"** tab
2. Click **"Repay Debt"**
3. Enter amount to repay
4. Confirm you have enough CENT
5. Confirm transaction

### Adjusting Interest Rate

**Why?** Balance borrowing costs with redemption protection

1. Go to **"Manage Trove"** tab
2. Click **"Adjust Rate"**
3. Select new interest rate
4. Review fee (if any)
5. Confirm transaction

**💡 Tip**: Lower your rate if CENT price is stable, raise it if you want protection.

### Closing Your Trove

**Requirement**: Must repay ALL debt first

1. Ensure you have enough CENT to cover debt + interest
2. Go to **"Manage Trove"** tab
3. Click **"Close Trove"**
4. Review: you'll get back all collateral
5. Confirm transaction

**Result**: Trove closed, collateral returned to your wallet

---

## Earning Yield (Stability Pool)

The Stability Pool is like a savings account for CENT that also protects the protocol.

### How It Works

1. You deposit CENT into the pool
2. Pool absorbs liquidations (converts CENT → Collateral)
3. You earn:
   - **Collateral gains** from liquidations (5% bonus)
   - **Interest yield** from protocol fees

### Estimated Returns

**APR varies based on**:
- Liquidation activity (more = higher APR)
- Your share of the pool
- Interest rate distribution

**Typical Range**: 3% - 15% APR

### Depositing to Stability Pool

1. Navigate to **"Earn"** page
2. Click **"Deposit"** tab
3. Enter CENT amount to deposit
4. Review:
   - Pool statistics
   - Estimated APR
   - Your share percentage
5. Confirm transaction

**💡 Tip**: Start with a small amount to test it out.

### Withdrawing from Stability Pool

1. Go to **"Earn"** page
2. Click **"Withdraw"** tab
3. Options:
   - Withdraw specific amount
   - Withdraw all
4. Choose whether to claim rewards
5. Confirm transaction

**Note**: You can withdraw anytime, no lockup period!

### Claiming Rewards

**Rewards include:**
- Collateral gains (BTC from liquidations)
- Accrued yield

**To claim:**
1. Go to **"Earn"** page
2. Click **"Claim Rewards"**
3. Review rewards available
4. Confirm transaction

**💡 Tip**: Gas costs add up, so claim when rewards are worth it.

---

## Redeeming CENT

Redemption lets you exchange CENT for collateral at face value ($1 of CENT = $1 of BTC).

### When to Redeem

**Good times:**
- CENT is trading above $1.00 (arbitrage opportunity)
- You want to exit to Bitcoin
- Protocol has low redemption fees

**Avoid when:**
- Redemption fees are high
- You plan to reborrow soon

### How Redemption Works

1. You send CENT to the protocol
2. Protocol finds Troves with lowest interest rates
3. Those Troves lose collateral (proportional to your redemption)
4. You receive equivalent value in collateral
5. A redemption fee is charged (0.5% - 5%)

### Redeeming CENT

1. Navigate to **"Redeem"** page
2. Check your CENT balance
3. Enter amount to redeem
4. Review:
   - Redemption fee (real-time calculation)
   - Collateral you'll receive
   - Net amount after fees
5. Click **"Preview Redemption"**
6. Review details carefully
7. Confirm transaction

**⚠️ Impact**: Troves with low interest rates will be partially closed

### Understanding Redemption Fees

**Fee Formula:**
```
Base Rate: 0.5% (minimum)
Fee increases with recent redemption activity
Decays over time if no redemptions

Current Fee = Base Rate + Activity Premium
```

**💡 Tip**: Check fee before redeeming - wait if it's too high.

---

## Using the Leverage Calculator

The Leverage Calculator helps you simulate leveraged positions **before** opening them.

### What is Leverage?

Leverage lets you amplify your Bitcoin exposure using borrowed CENT to buy more BTC.

**Example:**
```
Initial: 1 BTC
Leverage: 2x
Total Exposure: 2 BTC (1 yours + 1 borrowed)
```

### Using the Calculator

1. Navigate to **"Leverage"** page
2. Select collateral type
3. Enter initial collateral amount
4. Adjust leverage multiplier (1.5x - 5.0x)
5. Set interest rate

### Understanding Results

**Position Summary shows:**
- Total exposure (your BTC × multiplier)
- Debt amount (what you borrowed)
- Collateral Ratio
- Liquidation price
- Annual interest cost

**Price Scenarios show:**
- How your position performs at different prices
- ±10%, ±20%, ±30% price changes
- Profit/Loss for each scenario
- Liquidation indicators

### Risk Levels

**🟢 Healthy (CR ≥ 150%)**
- Safe position
- Room for price drops
- Monitor regularly

**🟡 At Risk (120% ≤ CR < 150%)**
- Dangerous zone
- Add collateral or reduce debt
- Watch closely

**🔴 Critical (CR < 120%)**
- IMMEDIATE LIQUIDATION RISK
- Add collateral NOW
- Or reduce leverage

### How to Execute Leverage

The calculator is **educational only**. To execute:

1. Use calculated values
2. Go to **"Borrow"** page
3. Open Trove with initial collateral
4. Manually perform loop borrowing:
   - Open Trove → Get CENT
   - Swap CENT for BTC (external DEX)
   - Add BTC to Trove
   - Repeat until desired leverage

**⚠️ Advanced**: Requires understanding of DeFi, risks involved.

---

## Understanding Governance

Medici follows Liquity V2's minimal governance model.

### Key Principles

**1. Immutable Core**
- Smart contracts cannot be upgraded
- No admin keys
- Protocol is decentralized

**2. User Control**
- You set your own interest rate
- You manage your own Trove
- No protocol governance votes needed

**3. Market-Driven**
- Redemptions create natural interest rate discovery
- Supply/demand balances the system
- No central planning

### Protocol Parameters

**View on Governance page:**
- Minimum debt: 2,000 CENT
- MCR (Minimum CR): 120%
- CCR (Critical CR): 150%
- Interest rate range: 0.5% - 25%
- Liquidation penalties: 5% (SP), 10% (redistribution)

**These are hardcoded and cannot change.**

### Collateral Types

Each collateral (WBTC18, cbBTC18) has its own:
- Trove Manager contract
- Stability Pool
- Sorted Troves list
- Price oracle

### Community Resources

- **Discord**: Discussion and support
- **GitHub**: Protocol code and documentation
- **Liquity V2 Whitepaper**: Technical details

---

## Rewards Program

Medici tracks user activity for potential future rewards.

### What's Tracked

- Trove operations (open, manage, close)
- Stability Pool deposits and duration
- Protocol usage and engagement

### Future Rewards

**Potential airdrops may reward:**
- Early adopters
- Active users
- Large depositors
- Long-term participants

**Note**: No guarantees, rewards are at protocol's discretion.

---

## Safety and Best Practices

### Collateral Ratio Management

**✅ DO:**
- Keep CR above 150% (safety buffer)
- Monitor collateral price regularly
- Add collateral if CR drops below 160%
- Use price alerts

**❌ DON'T:**
- Let CR drop below 130%
- Over-leverage yourself
- Ignore liquidation warnings
- Assume prices won't drop

### Interest Rate Strategy

**Conservative (New Users):**
- Start with 5% - 7%
- Better redemption protection
- Lower risk of being redeemed

**Aggressive (Experienced):**
- Use 1% - 3% if confident
- Lower costs
- Higher redemption risk
- Requires active monitoring

### Security Best Practices

1. **Verify Contract Addresses**
   - Check addresses match official docs
   - Use block explorers
   - Be cautious of phishing

2. **Start Small**
   - Test with small amounts first
   - Verify transactions work
   - Understand gas costs

3. **Use Hardware Wallets**
   - For large amounts
   - Extra security layer
   - Protect your keys

4. **Never Share**
   - Seed phrases
   - Private keys
   - Wallet passwords

### Risk Management

**Diversify:**
- Don't put all BTC in one Trove
- Consider multiple positions
- Balance risk and reward

**Monitor:**
- Set up price alerts
- Check CR daily
- Watch for liquidation risk

**Plan Ahead:**
- Have emergency funds (ETH for gas)
- Know how to add collateral quickly
- Understand liquidation process

---

## Troubleshooting

### Connection Issues

**Wallet won't connect:**
1. Refresh page
2. Check wallet is unlocked
3. Switch to Base Sepolia network
4. Clear cache and reconnect

**Wrong network:**
1. Check current network in wallet
2. Switch to Base Sepolia (Chain ID: 84532)
3. Refresh page

### Transaction Failures

**"Insufficient funds":**
- Check ETH balance for gas
- Ensure enough collateral/CENT

**"Transaction reverted":**
- CR may be too low
- Check minimum debt (2,000 CENT)
- Verify allowance approved

**High gas fees:**
- Wait for lower network activity
- Check gas price settings
- Consider timing your transaction

### Display Issues

**Balances not updating:**
1. Wait 30 seconds (blockchain confirmation)
2. Refresh page
3. Check transaction on block explorer

**Prices seem wrong:**
- Oracle may be updating
- Refresh page
- Check external price sources

### Getting Help

**Resources:**
1. **FAQ** - Check FAQ.md for common questions
2. **Discord** - Community support
3. **GitHub** - Technical issues
4. **Documentation** - Liquity V2 docs

**Before asking for help:**
1. Check this guide
2. Review error messages
3. Check transaction on explorer
4. Note: wallet, network, transaction hash

---

## Glossary

**APR** - Annual Percentage Rate, yearly interest or yield

**Collateral Ratio (CR)** - (Collateral Value / Debt Value) × 100

**CENT** - The stablecoin you borrow, pegged to $1 USD

**MCR** - Minimum Collateral Ratio (120%), liquidation threshold

**CCR** - Critical Collateral Ratio (150%), safety recommended

**Trove** - Your borrowing position (collateral + debt)

**Stability Pool** - Deposit CENT to earn yield and protect protocol

**Redemption** - Exchange CENT for collateral at face value

**Liquidation** - Forced closure when CR < 120%

**Hint Helpers** - Smart contracts that optimize gas for operations

**Interest Rate** - Annual rate you pay on borrowed CENT

**Upfront Fee** - One-time fee when borrowing or adjusting

**Gas Fee** - Network fee to process transactions

---

## Quick Reference

### Minimum Requirements

| Action | Requirement |
|--------|-------------|
| Open Trove | 2,000 CENT debt minimum |
| Collateral Ratio | 120% minimum (150%+ recommended) |
| Interest Rate | 0.5% - 25% APR |
| Stability Pool | No minimum deposit |

### Recommended Collateral Ratios

| Risk Level | CR Range | Action |
|------------|----------|--------|
| Safe | 200%+ | Relax, you're good |
| Healthy | 150% - 200% | Monitor regularly |
| Warning | 130% - 150% | Add collateral soon |
| Danger | 120% - 130% | Add collateral NOW |
| Critical | < 120% | LIQUIDATION |

### Gas Cost Estimates

| Operation | Estimated Gas | Cost at 50 gwei |
|-----------|---------------|-----------------|
| Approve | ~50,000 | $5 - $10 |
| Open Trove | ~350,000 | $35 - $70 |
| Add Collateral | ~150,000 | $15 - $30 |
| Repay Debt | ~150,000 | $15 - $30 |
| Close Trove | ~200,000 | $20 - $40 |
| SP Deposit | ~150,000 | $15 - $30 |
| SP Withdraw | ~150,000 | $15 - $30 |
| Redeem | ~250,000 | $25 - $50 |

**Note**: Gas costs vary with network activity

---

## Next Steps

Now that you understand how to use Medici:

1. **Start Small** - Open a test Trove with minimal collateral
2. **Explore Features** - Try Stability Pool with small deposit
3. **Learn by Doing** - Use Leverage Calculator to understand risks
4. **Join Community** - Connect with other users
5. **Stay Informed** - Follow updates and announcements

**Remember**: DeFi involves risks. Never invest more than you can afford to lose.

---

## Support

**Need help?**
- 📖 Read this guide thoroughly
- ❓ Check FAQ.md
- 💬 Join Discord community
- 🐛 Report bugs on GitHub
- 📧 Contact support (if available)

**Stay safe and happy borrowing!** 🚀

---

*Last Updated: 2025-10-26*
*Version: 1.0*
*For Medici v0.1.0*
