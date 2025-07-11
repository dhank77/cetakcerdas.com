@echo off
setlocal enabledelayedexpansion

REM Print Management System - Desktop App Installer (Windows)
REM This script automates the setup process for the desktop application

echo 🚀 Print Management System - Desktop App Setup
echo ==============================================
echo.

REM Check if running from correct directory
if not exist "artisan" (
    echo ❌ Please run this script from the Laravel project root directory
    pause
    exit /b 1
)

REM Check prerequisites
echo ℹ️  Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js found

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    python3 --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Python is not installed. Please install Python 3.8+ first.
        pause
        exit /b 1
    )
    set PYTHON_CMD=python3
    set PIP_CMD=pip3
) else (
    set PYTHON_CMD=python
    set PIP_CMD=pip
)

echo ✅ Python found

REM Check pip
%PIP_CMD% --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip is not installed. Please install pip first.
    pause
    exit /b 1
)

echo ✅ pip found

REM Step 1: Install Laravel dependencies
echo.
echo ℹ️  Step 1: Installing Laravel dependencies...
if exist "composer.json" (
    composer --version >nul 2>&1
    if not errorlevel 1 (
        composer install --no-dev --optimize-autoloader
        if errorlevel 1 (
            echo ❌ Failed to install Composer dependencies
            pause
            exit /b 1
        )
        echo ✅ Composer dependencies installed
    ) else (
        echo ⚠️  Composer not found, skipping PHP dependencies
    )
)

npm install
if errorlevel 1 (
    echo ❌ Failed to install NPM dependencies
    pause
    exit /b 1
)
echo ✅ NPM dependencies installed

REM Step 2: Setup environment
echo.
echo ℹ️  Step 2: Setting up environment...
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo ✅ Environment file created from example
        
        php --version >nul 2>&1
        if not errorlevel 1 (
            php artisan key:generate --no-interaction
            echo ✅ Application key generated
        )
    ) else (
        echo ⚠️  No .env.example found, please create .env manually
    )
) else (
    echo ✅ Environment file already exists
)

REM Step 3: Build Laravel frontend
echo.
echo ℹ️  Step 3: Building Laravel frontend...
npm run build
if errorlevel 1 (
    echo ❌ Failed to build Laravel frontend
    pause
    exit /b 1
)
echo ✅ Laravel frontend built

REM Step 4: Setup desktop app
echo.
echo ℹ️  Step 4: Setting up desktop application...
cd desktop-app

npm install
if errorlevel 1 (
    echo ❌ Failed to install desktop app dependencies
    pause
    exit /b 1
)
echo ✅ Desktop app dependencies installed

REM Step 5: Build Python service
echo.
echo ℹ️  Step 5: Building Python service...
cd ..\fastapi\pdf_analyzer

%PIP_CMD% install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install Python requirements
    pause
    exit /b 1
)
echo ✅ Python requirements installed

%PYTHON_CMD% build_executable.py
if errorlevel 1 (
    echo ❌ Failed to build Python executable
    pause
    exit /b 1
)
echo ✅ Python executable built

REM Step 6: Prepare desktop app assets
echo.
echo ℹ️  Step 6: Preparing desktop app assets...
cd ..\..\desktop-app

node build-script.js
if errorlevel 1 (
    echo ❌ Failed to prepare desktop app assets
    pause
    exit /b 1
)
echo ✅ Desktop app assets prepared

REM Step 7: Configuration
echo.
echo ℹ️  Step 7: Configuration setup...
echo.
echo ⚠️  IMPORTANT: You need to update the server URL configuration!
echo.
echo Please edit the following file:
echo   desktop-app\config.js
echo.
echo Change this line:
echo   SERVER_URL: 'https://your-laravel-server.com',
echo.
echo To your actual server URL:
echo   SERVER_URL: 'https://your-actual-domain.com',
echo.

REM Step 8: Final instructions
echo ℹ️  Setup completed! Next steps:
echo.
echo 1. Update server URL in desktop-app\config.js
echo 2. Test the setup:
echo    cd desktop-app
echo    npm run dev
echo.
echo 3. Build for production:
echo    npm run build:win
echo.
echo 4. Distribute the installer from desktop-app\dist\
echo.

echo ✅ Desktop app setup completed successfully!
echo.
echo ℹ️  For detailed documentation, see: DESKTOP_APP_SETUP.md
echo.
pause