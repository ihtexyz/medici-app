# Frequently Asked Questions (FAQ)

Quick answers to common questions about Medici.

---

## General Questions

### What is Medici?

Medici is a decentralized borrowing protocol built on Liquity V2 architecture. It allows you to use Bitcoin (WBTC, cbBTC) as collateral to borrow CENT stablecoin, or earn yield by depositing CENT into the Stability Pool.

### Is Medici safe?

Yes. Medici uses the audited Liquity V2 protocol with:
- ✅ Audited smart contracts (Trail of Bits, Cantina)
- ✅ No admin keys or centralized control
- ✅ Immutable contracts (cannot be upgraded)
- ✅ Battle-tested architecture
- ✅ Transparent on-chain operations

See [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) for detailed security analysis.

### What networks does Medici support?

**Currently:**
- Base Sepolia (Testnet) - Primary
- Arbitrum Sepolia (Testnet) - Legacy
- ETH Sepolia (Testnet) - Ethereum

**Future:**
- HyperEVM (Hyperliquid) - Planned
- Base Mainnet - When ready for production

### Do I need to create an account?

No! Medici is completely decentralized. Just connect your Web3 wallet (MetaMask, Coinbase Wallet, etc.) to start using it.

### What fees does Medici charge?

**Protocol Fees:**
- **Opening Fee**: 0.5% - 5% (one-time, dynamic)
- **Interest Rate**: 0.5% - 25% APR (you choose)
- **Redemption Fee**: 0.5% - 5% (dynamic based on activity)

**No Fees For:**
- Adding collateral
- Repaying debt
- Withdrawing from Stability Pool
- Closing Trove (after debt paid)

**Network Fees:**
- Gas fees paid to network validators (not to Medici)

---

## Borrowing / Troves

### What is a Trove?

A Trove is your individual borrowing position. It's like a vault that holds your collateral and tracks your debt. Each Trove is represented as an NFT on-chain.

### How much can I borrow?

**Maximum Borrowing Power:**
```
Max Debt = (Collateral Value / 1.20) - existing debt

Example:
Collateral: 1 WBTC at $67,500
Max Debt = $67,500 / 1.20 = $56,250 CENT

Recommended: Borrow up to $45,000 (150% CR) for safety
```

**Minimum**: 2,000 CENT

### What is Collateral Ratio (CR)?

Collateral Ratio shows how much your collateral is worth compared to your debt.

**Formula:**
```
CR = (Collateral Value / Debt Value) × 100
```

**Example:**
```
Collateral: 1 WBTC = $67,500
Debt: 40,000 CENT = $40,000
CR = ($67,500 / $40,000) × 100 = 168.75%
```

**Required**: Minimum 120% (liquidation threshold)
**Recommended**: 150% or higher (safety buffer)

### What happens if my CR drops below 120%?

Your Trove can be **liquidated**:
1. Anyone can trigger liquidation
2. Your collateral is used to repay debt
3. You lose collateral (plus 5-10% penalty)
4. Remaining collateral (if any) is returned

**Prevent this by:**
- Keeping CR above 150%
- Adding collateral when CR drops
- Monitoring prices regularly
- Setting up price alerts

### Can I have multiple Troves?

Yes! You can open multiple Troves using:
- Different collateral types (WBTC, cbBTC)
- Different ownerIndex values
- Same wallet address

Each Trove is independent and has its own CR, interest rate, and debt.

### How do I choose an interest rate?

**Lower Rates (0.5% - 2%):**
- ✅ Lower borrowing costs
- ❌ Higher redemption risk
- Best for: Active management, confident in stability

**Medium Rates (2% - 5%):**
- ✅ Balanced cost and protection
- ✅ Moderate redemption risk
- Best for: Most users, general use

**Higher Rates (5%+):**
- ✅ Better redemption protection
- ❌ Higher borrowing costs
- Best for: Long-term positions, risk-averse

**Recommendation**: Start with 5% for good balance.

### What is redemption and why should I care?

**Redemption** = Someone exchanges CENT for collateral at face value

**How it affects you:**
- Troves with lowest interest rates are redeemed first
- Your collateral decreases (proportional to redemption)
- Your debt decreases by the same amount
- Your CR stays the same

**Example:**
```
Before: 1.0 WBTC collateral, 40,000 CENT debt
Someone redeems 4,000 CENT from your Trove
After: 0.9 WBTC collateral, 36,000 CENT debt
CR stays the same!
```

**Why you should care:**
- Redemptions reduce your position size
- Low interest rates → more likely to be redeemed
- Higher interest rates → more protection

### Can I close my Trove anytime?

Yes, but you must:
1. Have enough CENT to repay ALL debt
2. Pay accrued interest
3. Confirm the transaction

**After closing:**
- All collateral returned to you
- Trove is closed permanently
- Can open new Trove later

---

## Stability Pool

### What is the Stability Pool?

The Stability Pool is a pool of CENT that acts as the first line of defense against liquidations. Depositors earn yield from liquidation bonuses and protocol revenue.

### How do I earn yield?

**Two Ways:**
1. **Liquidation Gains**: When Troves are liquidated, you receive collateral at a 5% discount
2. **Interest Yield**: Protocol distributes interest payments to depositors

**Typical APR**: 3% - 15% (varies with activity)

### Is my CENT deposit safe in the Stability Pool?

**Risks:**
- CENT is used to absorb liquidations (converted to collateral)
- During high liquidation events, your CENT becomes BTC
- Pool share may decrease if many depositors join

**Benefits:**
- You receive collateral at 5% discount (instant profit)
- Earn yield from interest distribution
- Help stabilize the protocol
- No lockup period - withdraw anytime

**Overall**: Low risk, especially in stable markets.

### What happens during liquidations?

**Your perspective:**
1. Liquidation occurs (Trove CR < 120%)
2. Your CENT is used to cover debt
3. You receive collateral at 5% bonus
4. Example: 10,000 CENT → $10,500 worth of BTC

**Result**: You made 5% profit instantly!

### Can I withdraw anytime?

**Yes!** No lockup period.

**Considerations:**
- Gas fees to withdraw
- May lose out on pending liquidations
- Claimed rewards require separate transaction

**Tip**: Withdraw when rewards > gas costs.

### How are rewards calculated?

**Your share** = Your deposit / Total pool size

**Example:**
```
Your deposit: 10,000 CENT
Total pool: 1,000,000 CENT
Your share: 1%

If liquidation: 50,000 CENT debt
You cover: 500 CENT (1% of 50,000)
You receive: $525 worth of BTC (5% bonus)
Profit: $25 instant gain
```

---

## CENT Stablecoin

### What is CENT?

CENT is a USD-pegged stablecoin (1 CENT = $1 USD) backed by Bitcoin collateral. It's based on Liquity V2's BOLD stablecoin architecture.

### How is CENT kept at $1?

**Three mechanisms:**
1. **Redemptions**: If CENT > $1, arbitrageurs redeem for profit (brings price down)
2. **Borrowing**: If CENT < $1, people borrow and sell (brings price up)
3. **Liquidations**: Maintains collateral backing

**Result**: Market forces naturally stabilize price around $1.

### Can I trade CENT?

**Currently**: Limited trading (testnet)

**Future**: DEX liquidity pools planned for:
- CENT/USDC
- CENT/ETH
- CENT/WBTC

### Where can I use CENT?

**On Medici:**
- Repay debt
- Deposit in Stability Pool
- Redeem for collateral

**Future Uses:**
- DeFi protocols (lending, DEX, yield farming)
- Cross-chain bridges
- Payment systems
- Savings accounts

### What if CENT loses its peg?

**If CENT > $1.00**:
- Redemptions become profitable
- Arbitrageurs redeem CENT for collateral
- Increased supply brings price down

**If CENT < $1.00**:
- Borrowing becomes attractive
- New Troves minted
- Buying pressure brings price up

**Safety**: System is over-collateralized (120%+ at all times)

---

## Technical Questions

### Which wallets are supported?

**Desktop:**
- MetaMask
- Coinbase Wallet
- WalletConnect compatible wallets
- Rainbow Wallet
- Trust Wallet

**Mobile:**
- MetaMask Mobile
- Coinbase Wallet
- WalletConnect compatible apps

### What are the gas costs?

**Typical Costs (at 50 gwei):**
| Operation | Gas | Cost |
|-----------|-----|------|
| Approve | ~50k | $5-10 |
| Open Trove | ~350k | $35-70 |
| Add Collateral | ~150k | $15-30 |
| Repay Debt | ~150k | $15-30 |
| Close Trove | ~200k | $20-40 |
| SP Deposit | ~150k | $15-30 |
| SP Withdraw | ~150k | $15-30 |
| Redeem | ~250k | $25-50 |

**Tip**: Gas costs vary with network congestion.

### Why do I need to approve tokens?

Ethereum tokens (ERC-20) require explicit approval before smart contracts can move them. This is a security feature.

**One-time approval per**:
- Token (WBTC, cbBTC, CENT)
- Contract (BorrowerOperations, StabilityPool, etc.)

**Tip**: Approvals cost gas but protect your assets.

### What happens if transactions fail?

**Common reasons:**
1. **Insufficient funds**: Not enough ETH for gas
2. **Slippage**: Fees exceeded max allowed
3. **CR too low**: Would put position below 120%
4. **Min debt**: Debt below 2,000 CENT

**Solution**: Check error message, adjust parameters, try again.

### Can I speed up transactions?

Yes! Most wallets let you:
1. Increase gas price (pay more for faster)
2. Replace transaction (resubmit with higher gas)
3. Cancel transaction (if pending)

**Tip**: Check network activity at etherscan.io/gastracker

---

## Safety and Security

### Is my crypto safe?

**What Medici CAN'T do:**
- Access your private keys
- Withdraw from your wallet without approval
- Move assets without your signature

**What you control:**
- Your wallet and keys
- Transaction approvals
- Collateral management

**Best practices:**
- Use hardware wallet for large amounts
- Verify contract addresses
- Never share seed phrases
- Start with small test amounts

### What if I lose my wallet?

**If you lose access to your wallet:**
- Your Trove is still on-chain
- Your Stability Pool deposit is safe
- But you can't access them without your keys

**Prevention:**
- Backup seed phrase securely
- Use hardware wallet
- Consider multi-sig for large amounts

### Can Medici be hacked?

**Protocol Security:**
- ✅ Contracts are audited and immutable
- ✅ No admin keys to compromise
- ✅ Decentralized (no single point of failure)
- ✅ Based on battle-tested Liquity V2

**Your responsibility:**
- Protect your seed phrase
- Verify you're on correct website
- Beware of phishing attempts
- Use reputable wallets

### What if smart contracts have bugs?

**Liquity V2 contracts:**
- Audited by Trail of Bits and Cantina
- Live since 2024 with no exploits
- Used in production with millions in TVL
- Open source and thoroughly reviewed

**Medici modifications:**
- None! We use contracts as-is
- Only interface with audited code
- Follow official integration patterns

**Risk**: Always possible but heavily mitigated.

---

## Troubleshooting

### My transaction is stuck pending

**Solutions:**
1. **Wait**: May just be slow network
2. **Speed up**: Increase gas price in wallet
3. **Cancel**: Cancel and resubmit
4. **Check**: Verify on block explorer

**Tip**: Use etherscan.io to check transaction status.

### Why can't I connect my wallet?

**Common fixes:**
1. Refresh page
2. Switch to correct network (Base Sepolia)
3. Clear browser cache
4. Try different browser
5. Update wallet extension

### Balances not showing correctly

**Fixes:**
1. Wait 30 seconds (blockchain confirmation)
2. Refresh page
3. Check transaction confirmed
4. Switch network and back

### Transaction failing repeatedly

**Check:**
1. Enough ETH for gas?
2. CR will stay above 120%?
3. Debt above 2,000 CENT minimum?
4. Approved token allowance?
5. Correct network selected?

### Getting "Insufficient funds" error

**You need:**
- ETH for gas fees (usually $5-50)
- Enough CENT to repay (if closing/repaying)
- Enough collateral (if opening)

**Solution**: Add funds to your wallet first.

---

## Economics and Strategy

### When should I borrow?

**Good times:**
- Bitcoin price is stable/rising
- Redemption rates are low
- You need liquidity but want BTC exposure
- Interest rates are favorable

**Avoid:**
- Bitcoin price is very volatile
- High redemption activity
- You're not confident managing CR

### When should I deposit in Stability Pool?

**Good times:**
- High liquidation activity (more yield)
- Low CENT utilization (less competition)
- Want passive yield on CENT
- Want to support protocol

**Considerations:**
- APR vs alternative yields
- CENT price stability
- Gas costs for claiming

### How do I maximize returns?

**Borrowing Strategy:**
1. Maintain high CR (150%+) for safety
2. Choose optimal interest rate
3. Monitor and adjust regularly
4. Take profits when appropriate

**Stability Pool Strategy:**
1. Deposit during high liquidation periods
2. Claim rewards when gas-efficient
3. Compound earnings
4. Monitor APR changes

### What's the best collateral ratio?

**Risk Levels:**
- **200%+**: Very safe, low capital efficiency
- **150%-200%**: Recommended, good balance
- **130%-150%**: Moderate risk, higher efficiency
- **120%-130%**: High risk, not recommended
- **<120%**: Liquidation!

**Recommendation**: Start at 180% CR, adjust as you gain experience.

---

## Advanced Topics

### What are Hint Helpers?

Hint Helpers are smart contracts that optimize gas costs by finding the correct position to insert your Trove in the sorted list.

**You don't need to understand them** - they work automatically.

### How does the sorted list work?

Troves are sorted by interest rate (lowest to highest) for efficient redemptions. The protocol uses a doubly-linked list for O(1) insertions.

**Impact on you**: None, it's transparent.

### Can I use flash loans?

**Currently**: Not directly supported

**Future**: May enable flash loan integrations for:
- Leverage automation
- Debt refinancing
- Collateral swaps

### What is the troveId?

`troveId` is a unique identifier for your Trove, computed as:
```
troveId = keccak256(owner_address, ownerIndex)
```

**ownerIndex** allows multiple Troves per wallet (0, 1, 2, ...).

### Can I transfer my Trove?

Yes! Troves are NFTs (ERC-721). You can:
- Transfer to another address
- Sell on NFT marketplaces (future)
- Use in DeFi protocols (future)

**Note**: Current UI doesn't support transfers yet.

---

## Governance

### Who controls Medici?

**No one!** The protocol is:
- Decentralized (no admin keys)
- Immutable (can't be upgraded)
- Community-operated

**You control:**
- Your Trove parameters
- Your interest rate
- Your liquidation protection

### Can parameters be changed?

**No.** Core parameters are hardcoded:
- MCR: 120%
- Min debt: 2,000 CENT
- Interest range: 0.5% - 25%
- Liquidation penalties: 5% / 10%

**This is a feature**, not a bug. It ensures predictability and removes governance risk.

### Will there be a governance token?

**Currently**: No plans

**Future**: Possible, but not necessary due to minimal governance model.

---

## Support

### How do I get help?

**Resources (in order):**
1. Read this FAQ
2. Check [USER_GUIDE.md](./USER_GUIDE.md)
3. Search Discord for similar issues
4. Ask in Discord #support channel
5. Open GitHub issue for bugs

### How do I report bugs?

1. Describe the issue clearly
2. Include: wallet, network, transaction hash
3. Screenshots if applicable
4. Steps to reproduce
5. Post on GitHub or Discord

### Is there customer support?

Medici is decentralized - no formal customer support. But:
- **Community**: Active Discord community
- **Documentation**: Comprehensive guides
- **Open Source**: Code is public for transparency

### Where can I learn more?

**Official Resources:**
- [USER_GUIDE.md](./USER_GUIDE.md) - Comprehensive user guide
- [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) - Security analysis
- [Liquity V2 Docs](https://liquity.gitbook.io/v2-whitepaper) - Protocol details

**Community:**
- Discord: Join for discussions
- GitHub: Code and technical docs
- Twitter: Updates and announcements

---

## Didn't find your answer?

**Next steps:**
1. Check the [User Guide](./USER_GUIDE.md) for detailed instructions
2. Join Discord #help channel
3. Search GitHub issues
4. Open new issue with your question

**Remember**: In DeFi, "doing your own research" (DYOR) is crucial. Take time to understand how everything works before using with significant amounts.

---

*Last Updated: 2025-10-26*
*Version: 1.0*
