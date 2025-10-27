# Deployment Guide

Complete guide for deploying Medici to staging and production environments.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Deploying to Staging](#deploying-to-staging)
6. [Deploying to Production](#deploying-to-production)
7. [Monitoring Deployments](#monitoring-deployments)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)

---

## Overview

Medici uses a comprehensive CI/CD pipeline with:
- **GitHub Actions** for continuous integration and testing
- **Vercel** for hosting and deployment
- **Automated testing** (Jest + Playwright)
- **Performance monitoring** (Lighthouse CI)
- **Environment-specific deployments** (staging + production)

### Deployment Flow

```
Push to Branch → CI Tests → Build → Deploy to Staging → Manual Approval → Deploy to Production
```

---

## Prerequisites

### Required Accounts

1. **GitHub Account** with repository access
2. **Vercel Account** linked to the repository
3. **Node.js 20.x** installed locally (for testing)

### Required Secrets

Configure these in GitHub repository settings (`Settings > Secrets and variables > Actions`):

#### Vercel Secrets
```bash
VERCEL_TOKEN          # Vercel API token
VERCEL_ORG_ID         # Vercel organization ID
VERCEL_PROJECT_ID     # Vercel project ID
```

#### Application Secrets
```bash
VITE_REOWN_PROJECT_ID           # Reown (WalletConnect) project ID
VITE_ONCHAINKIT_API_KEY         # OnchainKit API key
VITE_RPC_URL                    # RPC endpoint (staging)
VITE_RPC_URL_PROD               # RPC endpoint (production)
VITE_SENTRY_DSN                 # Sentry error tracking DSN (optional)
```

### How to Get Secrets

**Vercel Token:**
1. Go to https://vercel.com/account/tokens
2. Create new token with "Deploy" scope
3. Copy and add to GitHub secrets

**Vercel Org/Project IDs:**
```bash
# Install Vercel CLI
npm install -g vercel

# Link project
vercel link

# View project settings
cat .vercel/project.json
```

---

## Environment Setup

### Local Development

```bash
# Clone repository
git clone https://github.com/your-org/medici-app-final.git
cd medici-app-final

# Install dependencies
npm ci --legacy-peer-deps

# Create .env file
cp env.template .env

# Add environment variables to .env
VITE_REOWN_PROJECT_ID=your_project_id
VITE_ONCHAINKIT_API_KEY=your_api_key
# ... other variables

# Start dev server
npm run dev
```

### Environment Files

**`.env.local`** - Local development
**`.env.staging`** - Staging environment (Vercel)
**`.env.production`** - Production environment (Vercel)

Configure these in Vercel dashboard:
1. Go to Project → Settings → Environment Variables
2. Add variables for each environment
3. Click "Save"

---

## CI/CD Pipeline

### Workflow Files

Located in `.github/workflows/`:

#### `ci.yml` - Main CI Pipeline
Runs on every push and pull request:
- ✅ **Lint** - ESLint + Prettier checks
- ✅ **Test** - Jest unit tests with coverage
- ✅ **Build** - Production build verification
- ✅ **E2E** - Playwright end-to-end tests

#### `vercel-preview.yml` - Deployment Pipeline
Deploys to Vercel environments:
- 🚀 **Staging** - Automatic deployment on push to main/staging/develop
- 🌐 **Production** - Manual approval required for main branch

### Pipeline Jobs

**1. Lint (Code Quality)**
```yaml
- ESLint checks
- Config formatting (JSON/YAML/TOML)
```

**2. Test (Unit Tests)**
```yaml
- Run Jest with coverage
- Upload coverage to Codecov
```

**3. Build (Production Build)**
```yaml
- npm run build
- Verify dist/ directory
- Upload build artifacts
```

**4. E2E (End-to-End Tests)**
```yaml
- Install Playwright browsers
- Run test suite
- Upload test reports
```

**5. Performance (Lighthouse CI)**
```yaml
- Run Lighthouse audits
- Check Core Web Vitals
- Generate performance report
```

**6. Deploy (Staging/Production)**
```yaml
- Build with Vercel CLI
- Deploy to environment
- Comment PR with URL (for PRs)
```

---

## Deploying to Staging

### Automatic Deployment

Staging deploys automatically on push to:
- `main` branch
- `staging` branch
- `develop` branch

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to staging
vercel --token=$VERCEL_TOKEN

# View deployment
vercel ls
```

### Staging URL

Preview deployments are available at:
```
https://medici-[hash].vercel.app
```

Production staging:
```
https://medici-staging.vercel.app
```

### Testing Staging

After deployment:

1. **Smoke Test** - Verify app loads
2. **Wallet Connection** - Test wallet integration
3. **Core Features** - Test borrow/earn/swap
4. **UI/UX** - Check animations and toasts
5. **Error Handling** - Trigger errors and verify messages

```bash
# Run E2E tests against staging
PLAYWRIGHT_BASE_URL=https://medici-staging.vercel.app npm run test:e2e
```

---

## Deploying to Production

### Requirements

Before deploying to production:
- ✅ All CI tests must pass
- ✅ Staging deployment successful
- ✅ Manual testing completed
- ✅ Security review approved (if applicable)

### Production Deployment

Production deploys automatically on push to `main`:

```bash
# Ensure you're on main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge your feature
git merge feature/your-feature

# Push to trigger deployment
git push origin main
```

### Manual Production Deployment

```bash
# Deploy to production
vercel --prod --token=$VERCEL_TOKEN

# Alias to production domain
vercel alias set medici-[hash].vercel.app medici.vercel.app
```

### Production URL

```
https://medici.vercel.app
```

### Post-Deployment Checklist

After production deployment:

- [ ] **Verify deployment URL** - Check app loads correctly
- [ ] **Test critical paths** - Borrow, Earn, Swap, Portfolio
- [ ] **Monitor errors** - Check Sentry for issues
- [ ] **Check performance** - Run Lighthouse audit
- [ ] **Verify analytics** - Ensure tracking works
- [ ] **Test on mobile** - Check responsive design
- [ ] **Announce deployment** - Notify team/users

---

## Monitoring Deployments

### GitHub Actions

View CI/CD status:
1. Go to repository → Actions tab
2. Select workflow run
3. View job logs and artifacts

### Vercel Dashboard

Monitor deployments:
1. Go to https://vercel.com/dashboard
2. Select project
3. View deployments list
4. Click deployment for details

### Real-Time Monitoring

**Vercel Analytics:**
```
https://vercel.com/[your-org]/medici-app-final/analytics
```

**Vercel Logs:**
```
https://vercel.com/[your-org]/medici-app-final/logs
```

### Performance Monitoring

**Lighthouse CI Reports:**
- Uploaded to temporary storage
- Link provided in CI run

**Sentry Error Tracking:**
```
https://sentry.io/organizations/[your-org]/projects/medici
```

---

## Rollback Procedures

### Instant Rollback (Vercel)

```bash
# List recent deployments
vercel ls

# Promote previous deployment to production
vercel promote [deployment-url] --prod
```

### Git Rollback

```bash
# Find commit to rollback to
git log --oneline

# Create revert commit
git revert [commit-hash]

# Push to trigger redeployment
git push origin main
```

### Emergency Rollback

Via Vercel Dashboard:
1. Go to Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Confirm

---

## Troubleshooting

### Build Failures

**Error: "Cannot find module"**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Error: "TypeScript compilation failed"**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Fix errors in reported files
```

### Deployment Failures

**Error: "VERCEL_TOKEN not found"**
- Check GitHub Secrets are configured correctly
- Ensure secret names match workflow file

**Error: "Build exceeded time limit"**
- Increase Vercel timeout in dashboard
- Optimize build by removing unused dependencies

### Runtime Errors

**"Failed to fetch"**
- Check RPC endpoints in environment variables
- Verify network connectivity

**"Wallet not connecting"**
- Verify VITE_REOWN_PROJECT_ID is correct
- Check Reown dashboard for quota

**"Contract call failed"**
- Verify contract addresses in env
- Check chain ID matches network

### Performance Issues

**Slow load times:**
```bash
# Run Lighthouse audit
npm install -g @lhci/cli
lhci autorun --config=.lighthouserc.json
```

**High bundle size:**
```bash
# Analyze bundle
npm run build
npx vite-bundle-visualizer
```

### Getting Help

1. **Check logs** - GitHub Actions + Vercel logs
2. **Search issues** - Check GitHub Issues
3. **Ask team** - Discord/Slack support channel
4. **Create issue** - Provide logs and reproduction steps

---

## Best Practices

### Deployment Checklist

Before each deployment:
- [ ] Run tests locally: `npm test`
- [ ] Build successfully: `npm run build`
- [ ] Check bundle size: Review dist/ folder
- [ ] Update CHANGELOG.md
- [ ] Tag release: `git tag v1.0.0`
- [ ] Create GitHub release notes

### Branch Strategy

- `main` → Production (protected)
- `staging` → Staging environment
- `develop` → Development environment
- `feature/*` → Feature branches

### Code Review

All changes require:
- ✅ PR review from team member
- ✅ CI tests passing
- ✅ No merge conflicts
- ✅ Updated documentation

---

## Performance Targets

### Lighthouse Scores

- **Performance**: ≥ 70
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 90
- **SEO**: ≥ 90

### Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 3.0s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Load Times

- **First Contentful Paint**: < 2.0s
- **Speed Index**: < 3.0s
- **Time to Interactive**: < 5.0s

---

## Security

### Environment Variables

**Never commit:**
- Private keys
- API secrets
- Database credentials
- Auth tokens

**Always use:**
- GitHub Secrets for CI
- Vercel Environment Variables for runtime
- `.env.example` for documentation

### Headers

Security headers configured in `vercel.json`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Vite Documentation](https://vitejs.dev/guide/)

---

**Status**: ✅ Ready for deployment
**Last Updated**: 2025-10-27
**Version**: 1.0.0
