#!/bin/bash

echo "🚀 Building Print Management System Desktop App..."
echo "================================================"

echo ""
echo "📦 Step 1: Preparing build environment..."
node build-script.js
if [ $? -ne 0 ]; then
    echo "❌ Build preparation failed!"
    exit 1
fi

echo ""
echo "📦 Step 2: Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed!"
    exit 1
fi

echo ""
echo "🔨 Step 3: Building desktop application..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    npm run build:mac
    INSTALLER_PATH="dist/Print Management System.dmg"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    npm run build:linux
    INSTALLER_PATH="dist/Print Management System.AppImage"
else
    # Default to Linux
    npm run build:linux
    INSTALLER_PATH="dist/Print Management System.AppImage"
fi

if [ $? -ne 0 ]; then
    echo "❌ Desktop app build failed!"
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"
echo "📁 Installer location: $INSTALLER_PATH"
echo ""