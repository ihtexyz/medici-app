#!/bin/bash

# Deploy Origami to Netlify
# Site: origamibtc.netlify.app
# Site ID: 390d0bed-aac1-4824-b39d-ad2b3268a064

echo "🚀 Deploying Origami to origamibtc.netlify.app..."
echo ""

# Build first
echo "📦 Building..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Deploy to Netlify
echo "📤 Deploying to Netlify..."
npx netlify-cli deploy \
    --dir=dist \
    --prod \
    --site=390d0bed-aac1-4824-b39d-ad2b3268a064

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "🌐 Visit: https://origamibtc.netlify.app"
else
    echo "❌ Deployment failed!"
    exit 1
fi

