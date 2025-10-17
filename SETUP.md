# 🚀 Origami Setup Guide

Complete setup instructions for deploying and running the Origami dapp.

---

## 📋 Prerequisites

- **Node.js**: v18+ (recommended: v20)
- **npm** or **yarn**
- **Git**
- **Reown Project ID** (for authentication)
- **SwapKit API credentials** (optional, for cross-chain swaps)

---

## 🔧 Initial Setup

### 1. Clone and Install

```bash
cd /Users/ethikotiah/Venice\ Fi/finkfi/origami
npm install
```

### 2. Environment Configuration

Create a `.env` file from the template:

```bash
cp env.template .env
```

Edit `.env` and add your credentials:

```bash
# Required
VITE_REOWN_PROJECT_ID=your_actual_reown_project_id

# Optional (for real swaps)
VITE_SWAPKIT_API_KEY=your_swapkit_api_key
VITE_SWAPKIT_PROJECT_ID=your_swapkit_project_id

# Update contract addresses when deployed
VITE_CENT_TOKEN_ADDRESS=0xYourCentTokenAddress
VITE_WBTC_TOKEN_ADDRESS=0xYourWBTCAddress
# ... etc
```

---

## 🔐 Get Reown Project ID

**Reown AppKit** powers the authentication (wallet connections, email, social login).

### Steps:

1. **Go to:** https://cloud.reown.com
2. **Sign up/Login** with GitHub or email
3. **Create a new project**:
   - Name: "Origami"
   - Type: "AppKit"
4. **Copy the Project ID**
5. **Add to .env**:
   ```bash
   VITE_REOWN_PROJECT_ID=abc123def456...
   ```

### What it enables:
- ✅ Wallet connections (MetaMask, Coinbase, Rainbow, etc.)
- ✅ Email login (passwordless)
- ✅ Social login (Google, GitHub, Apple)
- ✅ Multi-chain support
- ✅ Account management

---

## 🔄 Get SwapKit Credentials (Optional)

**SwapKit** powers cross-chain swaps (BTC ↔ USDC ↔ ETH).

### Steps:

1. **Go to:** https://swapkit.dev
2. **Sign up** for API access
3. **Create an API key**
4. **Copy credentials**:
   - API Key
   - Project ID
5. **Add to .env**:
   ```bash
   VITE_SWAPKIT_API_KEY=your_api_key
   VITE_SWAPKIT_PROJECT_ID=your_project_id
   ```

**Note:** The app works without SwapKit credentials (falls back to mock mode for development).

---

## 📝 Update Contract Addresses

After deploying contracts to testnet/mainnet, update the addresses in `.env`:

### Get addresses from:
- Venice Fi contract deployments (register-master repo)
- Genesis Vault deployments
- Token contracts (CENT, WBTC, USDC, USDT)

### Example:

```bash
# Arbitrum Sepolia Testnet
VITE_CENT_TOKEN_ADDRESS=0x1234567890abcdef...
VITE_WBTC_TOKEN_ADDRESS=0xabcdef1234567890...
VITE_USDC_TOKEN_ADDRESS=0x9876543210fedcba...
VITE_BTC_VAULT_ADDRESS=0xfedcba0987654321...
```

---

## 🏗️ Development

### Run locally:

```bash
npm run dev
```

App will be available at: `http://localhost:5173`

### Build for production:

```bash
npm run build
```

Output: `dist/` folder

### Preview production build:

```bash
npm run preview
```

---

## 🌐 Deployment

### Netlify (Recommended)

#### Option 1: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

#### Option 2: Netlify UI

1. Go to: https://app.netlify.com
2. Connect GitHub repo: `Venicefi/Origami`
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add environment variables in Netlify UI:
   - `VITE_REOWN_PROJECT_ID`
   - `VITE_SWAPKIT_API_KEY` (optional)
   - `VITE_SWAPKIT_PROJECT_ID` (optional)
   - All contract addresses
5. Deploy!

#### Option 3: Netlify Drop

1. Run `npm run build`
2. Go to: https://app.netlify.com/drop
3. Drag `dist` folder
4. Site will be live instantly

**Current Deployment:**
- Domain: `origamibtc.netlify.app`
- Project ID: `390d0bed-aac1-4824-b39d-ad2b3268a064`

---

## ✅ Testing Checklist

### Authentication:
- [ ] Connect MetaMask wallet
- [ ] Connect Coinbase wallet
- [ ] Connect via WalletConnect
- [ ] Login with email (passwordless)
- [ ] Login with Google
- [ ] Login with GitHub
- [ ] Disconnect wallet
- [ ] Reconnect (should persist)

### Pages:
- [ ] Home: Balance displays, market info shows
- [ ] Portfolio: Assets list, total value correct
- [ ] Borrow: Complete flow, transaction succeeds
- [ ] Swap: Get quote, execute swap, see confirmation
- [ ] Invest: Vault cards show, deposit/withdraw work

### Mobile:
- [ ] Bottom navigation works
- [ ] All pages responsive
- [ ] Touch interactions smooth
- [ ] Safe area insets correct (notch/home indicator)

### Cross-Chain Swaps:
- [ ] BTC → USDC quote loads
- [ ] USDC → BTC quote loads
- [ ] Swap executes successfully
- [ ] Transaction hash displayed
- [ ] Balance updates after swap

### Vaults:
- [ ] Vault TVL displays
- [ ] User balance shows
- [ ] Deposit flow works
- [ ] Withdraw flow works
- [ ] Shares update correctly

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@reown/appkit/react'"

**Solution:**
```bash
npm install @reown/appkit @reown/appkit-adapter-wagmi
```

### Issue: "Project ID is required"

**Solution:** Add `VITE_REOWN_PROJECT_ID` to `.env` file.

### Issue: "Network not supported"

**Solution:** 
1. Check `VITE_CHAIN_ID` in `.env`
2. Ensure it matches your wallet network
3. Switch wallet to Arbitrum Sepolia (421614)

### Issue: Swaps not working

**Solution:**
1. Check if SwapKit credentials are set (optional)
2. App uses mock mode if credentials missing
3. For real swaps, add API keys to `.env`

### Issue: Contract calls failing

**Solution:**
1. Verify contract addresses in `.env`
2. Check contracts are deployed to correct network
3. Ensure wallet is on same network (Arbitrum Sepolia)

### Issue: Build errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## 📚 Documentation

- **Reown AppKit Docs**: https://docs.reown.com/appkit/overview
- **Wagmi Docs**: https://wagmi.sh
- **SwapKit Docs**: https://docs.swapkit.dev
- **Vite Docs**: https://vitejs.dev
- **Netlify Docs**: https://docs.netlify.com

---

## 🔒 Security

### Environment Variables:
- ✅ Never commit `.env` to git (already in `.gitignore`)
- ✅ Use different values for staging/production
- ✅ Rotate API keys regularly
- ✅ Use environment-specific Reown projects

### Smart Contracts:
- ✅ Audit before mainnet deployment
- ✅ Use testnet for development
- ✅ Test all flows thoroughly
- ✅ Monitor for suspicious activity

### User Data:
- ✅ No private keys stored
- ✅ Wallet state managed by Reown/Wagmi
- ✅ No sensitive data in localStorage
- ✅ HTTPS only in production

---

## 🚀 Production Checklist

Before deploying to mainnet:

- [ ] All environment variables set
- [ ] Reown Project ID configured
- [ ] Contract addresses verified
- [ ] All tests passing
- [ ] QA testing complete
- [ ] Mobile testing complete
- [ ] Smart contracts audited
- [ ] Security review done
- [ ] Analytics configured
- [ ] Error monitoring setup (Sentry)
- [ ] Domain configured (origamibtc.com)
- [ ] SSL certificate active
- [ ] Performance optimized
- [ ] SEO metadata added
- [ ] Social share images created

---

## 📞 Support

- **GitHub Issues**: https://github.com/Venicefi/Origami/issues
- **Discord**: https://discord.gg/venicefi
- **Twitter**: https://twitter.com/VeniceFi
- **Email**: support@venicefi.com

---

## 📄 License

MIT License - See LICENSE file for details


