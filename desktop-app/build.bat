@echo off
echo 🚀 Building Print Management System Desktop App...
echo ================================================

echo.
echo 📦 Step 1: Preparing build environment...
node build-script.js
if errorlevel 1 (
    echo ❌ Build preparation failed!
    pause
    exit /b 1
)

echo.
echo 📦 Step 2: Installing Node.js dependencies...
npm install
if errorlevel 1 (
    echo ❌ npm install failed!
    pause
    exit /b 1
)

echo.
echo 🔨 Step 3: Building desktop application...
npm run build:win
if errorlevel 1 (
    echo ❌ Desktop app build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!
echo 📁 Installer location: dist\Print Management System Setup.exe
echo.
pause