# 🚀 Origami Deployment Guide

## ✅ **Current Status**

### Completed:
- ✅ **UI Redesign**: 100% complete (Figma Coinbase style)
- ✅ **Reown AppKit**: Configured with project ID `b6c8592d7c27bead6b6036478b0a7a42`
- ✅ **Contract Addresses**: Updated for Arbitrum Sepolia testnet
- ✅ **Build System**: TypeScript + Vite working perfectly
- ✅ **GitHub**: All changes pushed to `main` branch

### Ready For:
- 🟡 Local testing
- 🟡 Netlify deployment
- 🟡 QA testing

---

## 🧪 **Testing the App Locally**

### 1. Access the Dev Server

The server should be running at:
```
http://localhost:5173
```

Open this in your browser to test the app.

### 2. Test Authentication (Reown AppKit)

#### Connect Wallet:
1. Click **"Connect"** button in the header
2. Should see Reown AppKit modal
3. Try connecting with:
   - **MetaMask** (if installed)
   - **Coinbase Wallet** (if installed)
   - **WalletConnect** (scan QR with mobile wallet)

#### Email Login:
1. Click "Connect" → "Email"
2. Enter your email address
3. Check inbox for magic link
4. Click link to authenticate

#### Social Login:
1. Click "Connect" → "Social"
2. Choose Google, GitHub, or Apple
3. Complete OAuth flow

### 3. Test Pages

Navigate through all pages using bottom navigation:

#### Home (Overview):
- [ ] Total balance displays (should show $0.00 if no funds)
- [ ] Market info cards show BTC and USDC prices
- [ ] "Fund your account" CTA visible when not connected
- [ ] Quick actions appear after connecting

#### Portfolio:
- [ ] Total balance card with orange gradient
- [ ] Token cards show (BTC, USDC, CENT)
- [ ] "Recent activity" empty state shows
- [ ] Quick actions work ("Buy More", "Convert")

#### Borrow:
- [ ] Can select asset (CENT)
- [ ] Amount input works
- [ ] Quick chips work ($100, $500, $1000)
- [ ] Review screen shows calculations
- [ ] Collateral, APR, duration display correctly

#### Convert (Swap):
- [ ] From/To token cards display
- [ ] Amount input works
- [ ] Swap button (⇅) switches tokens
- [ ] Quote loads (may be mock data)
- [ ] Preview screen shows exchange rate and fees

#### Invest:
- [ ] Vault cards display with gradients
- [ ] TVL and APY show (may be mock data)
- [ ] Deposit/Withdraw buttons visible when connected
- [ ] "How it works" section displays

### 4. Test Mobile Responsiveness

Resize your browser to test mobile view:

- [ ] Bottom navigation stays at bottom
- [ ] All pages fit mobile screen (max-width: 500px)
- [ ] Text is readable
- [ ] Buttons are tappable
- [ ] No horizontal scrolling

### 5. Check Browser Console

Look for:
- ✅ `🔐 Reown AppKit initialized with project: b6c8592d...`
- ❌ No red errors
- ⚠️ Warnings are OK (mock data warnings expected)

---

## 🌐 **Deploy to Netlify**

### Option 1: Via Netlify UI (Recommended)

1. **Go to Netlify:**
   ```
   https://app.netlify.com
   ```

2. **Add New Site:**
   - Click "Add new site" → "Import an existing project"

3. **Connect GitHub:**
   - Choose "GitHub"
   - Select organization: `Venicefi`
   - Select repository: `Origami`
   - Branch: `main`

4. **Configure Build Settings:**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

5. **Environment Variables:**
   
   Add these (optional, app works without them):
   ```
   VITE_REOWN_PROJECT_ID=b6c8592d7c27bead6b6036478b0a7a42
   ```
   
   For SwapKit (optional):
   ```
   VITE_SWAPKIT_API_KEY=your_api_key
   VITE_SWAPKIT_PROJECT_ID=your_project_id
   ```

6. **Deploy:**
   - Click "Deploy site"
   - Wait ~2 minutes for build
   - Site will be live at: `https://[random-name].netlify.app`

7. **Claim Custom Domain:**
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Enter: `origamibtc.netlify.app`
   - Confirm

### Option 2: Via Netlify CLI

If you have Netlify CLI installed:

```bash
# Login to Netlify
netlify login

# Link to existing site (if you have one)
netlify link

# OR create new site
netlify init

# Deploy to production
netlify deploy --prod
```

### Option 3: Via Netlify Drop

For quick testing:

```bash
# Build the app
npm run build

# Go to Netlify Drop
# https://app.netlify.com/drop

# Drag the 'dist' folder
# Site deploys instantly!
```

---

## ✅ **Post-Deployment Checklist**

Once deployed, test the live site:

### Authentication Tests:
- [ ] Connect MetaMask
- [ ] Connect Coinbase Wallet
- [ ] Connect via WalletConnect
- [ ] Email login works
- [ ] Social login works (Google/GitHub)
- [ ] Disconnect and reconnect
- [ ] Wallet state persists on refresh

### Functionality Tests:
- [ ] All pages load
- [ ] Navigation works
- [ ] Images/icons load
- [ ] Fonts load correctly
- [ ] Colors match design (black background, orange accents)
- [ ] Mobile view works

### Network Tests:
- [ ] Switch wallet to Arbitrum Sepolia (Chain ID: 421614)
- [ ] App detects network
- [ ] Contract addresses valid

### Performance:
- [ ] Page load time <3 seconds
- [ ] No layout shifts
- [ ] Smooth animations
- [ ] Responsive interactions

---

## 🐛 **Troubleshooting**

### Build Fails on Netlify

**Symptom:** Build fails with errors

**Solutions:**
1. Check build logs in Netlify dashboard
2. Verify `package.json` has correct scripts
3. Try building locally first: `npm run build`
4. Check Node version (Netlify uses Node 18 by default)

### Reown AppKit Not Working

**Symptom:** "Connect" button doesn't open modal

**Solutions:**
1. Check browser console for errors
2. Verify project ID is correct: `b6c8592d7c27bead6b6036478b0a7a42`
3. Check Reown dashboard: https://cloud.reown.com
4. Try clearing browser cache
5. Test in incognito mode

### Wallet Connection Fails

**Symptom:** Wallet doesn't connect

**Solutions:**
1. Check wallet is unlocked
2. Check wallet is on correct network (Arbitrum Sepolia)
3. Try refreshing page
4. Try different wallet
5. Check Reown status page

### Pages Don't Load

**Symptom:** Blank screen or errors

**Solutions:**
1. Check browser console
2. Verify all routes in `src/App.tsx`
3. Check lazy loading imports
4. Try hard refresh (Cmd+Shift+R)

### Mobile View Broken

**Symptom:** Layout issues on mobile

**Solutions:**
1. Check viewport meta tag in `index.html`
2. Test different screen sizes
3. Check CSS media queries
4. Verify `max-width: 500px` on app shell

---

## 📊 **Monitoring & Analytics**

### Post-Launch Setup:

#### 1. Error Tracking (Sentry)
```bash
npm install @sentry/react
```

Add to `src/main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

#### 2. Analytics (PostHog)
```bash
npm install posthog-js
```

Add to `src/main.tsx`:
```typescript
import posthog from 'posthog-js'

posthog.init('YOUR_API_KEY', {
  api_host: 'https://app.posthog.com'
})
```

#### 3. Uptime Monitoring

Use Netlify's built-in analytics or:
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## 🔐 **Security Checklist**

Before production:

### Code:
- [ ] No private keys in code
- [ ] No API secrets in code
- [ ] Environment variables used correctly
- [ ] .env files in .gitignore

### Deployment:
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting on APIs
- [ ] CSP headers set

### Smart Contracts:
- [ ] Contracts audited
- [ ] Testnet testing complete
- [ ] Emergency pause mechanism
- [ ] Multi-sig for admin functions

---

## 📈 **Performance Optimization**

### Current Bundle Size:
- Total: ~1.6 MB (470 KB gzipped)
- Main chunk: Large (see build warnings)

### TODO (Future):
1. **Code splitting:**
   ```typescript
   // Use React.lazy for routes
   const Borrow = lazy(() => import('./pages/Borrow'))
   ```

2. **Image optimization:**
   - Convert to WebP
   - Use proper sizing
   - Lazy load images

3. **Bundle analysis:**
   ```bash
   npm run build -- --analyze
   ```

4. **CDN for assets:**
   - Use Netlify CDN (automatic)
   - Or CloudFlare for extra speed

---

## 🎯 **Next Steps After Deployment**

1. **User Testing:**
   - Share link with team
   - Test on real devices
   - Collect feedback

2. **Marketing:**
   - Share on Twitter
   - Post in Discord
   - Update website

3. **Documentation:**
   - User guide
   - FAQ
   - Video tutorials

4. **Monitoring:**
   - Set up alerts
   - Track metrics
   - Monitor errors

5. **Iterate:**
   - Fix bugs
   - Add features
   - Improve UX

---

## 📞 **Support**

### Resources:
- **Reown Docs**: https://docs.reown.com
- **Netlify Docs**: https://docs.netlify.com
- **GitHub Issues**: https://github.com/Venicefi/Origami/issues

### Team:
- **Discord**: https://discord.gg/venicefi
- **Twitter**: @VeniceFi
- **Email**: support@venicefi.com

---

## ✨ **Summary**

**You're ready to deploy!**

1. ✅ Reown AppKit configured
2. ✅ Build working perfectly
3. ✅ All code pushed to GitHub
4. ✅ Ready for Netlify

**Just deploy and test! 🚀**
