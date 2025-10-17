#!/bin/bash

# Origami Deployment Script
# Builds and deploys to Netlify

set -e

echo "🚀 Origami Deployment Script"
echo "============================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the project root"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the app
echo "🔨 Building app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Check build size
BUILD_SIZE=$(du -sh dist | cut -f1)
echo "📊 Build size: $BUILD_SIZE"
echo ""

# Check if netlify CLI is installed
if command -v netlify &> /dev/null; then
    echo "🌐 Netlify CLI found"
    echo ""
    echo "Deploy options:"
    echo "1. Deploy to production"
    echo "2. Deploy preview"
    echo "3. Just build (skip deploy)"
    echo ""
    read -p "Choose option (1-3): " option
    
    case $option in
        1)
            echo "🚀 Deploying to production..."
            netlify deploy --prod
            ;;
        2)
            echo "🚀 Deploying preview..."
            netlify deploy
            ;;
        3)
            echo "✅ Build complete! dist/ folder ready"
            echo "You can manually deploy via:"
            echo "  - Netlify UI: https://app.netlify.com"
            echo "  - Netlify Drop: https://app.netlify.com/drop"
            ;;
        *)
            echo "❌ Invalid option"
            exit 1
            ;;
    esac
else
    echo "⚠️  Netlify CLI not installed"
    echo ""
    echo "Build complete! You can deploy via:"
    echo ""
    echo "Option 1: Netlify Drop (easiest)"
    echo "  1. Go to: https://app.netlify.com/drop"
    echo "  2. Drag the 'dist' folder"
    echo "  3. Done!"
    echo ""
    echo "Option 2: Install Netlify CLI"
    echo "  npm install -g netlify-cli"
    echo "  netlify login"
    echo "  netlify deploy --prod"
    echo ""
    echo "Option 3: GitHub Integration"
    echo "  1. Go to: https://app.netlify.com"
    echo "  2. Add new site → Import from Git"
    echo "  3. Connect Venicefi/Origami repo"
    echo "  4. Deploy!"
fi

echo ""
echo "✨ Done!"


