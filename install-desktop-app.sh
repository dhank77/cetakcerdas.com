#!/bin/bash

# Print Management System - Desktop App Installer
# This script automates the setup process for the desktop application

set -e  # Exit on any error

echo "🚀 Print Management System - Desktop App Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running from correct directory
if [ ! -f "artisan" ]; then
    print_error "Please run this script from the Laravel project root directory"
    exit 1
fi

# Check prerequisites
print_info "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) found"

# Check Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    print_error "Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

print_success "Python found"

# Check pip
if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
    print_error "pip is not installed. Please install pip first."
    exit 1
fi

PIP_CMD="pip3"
if ! command -v pip3 &> /dev/null; then
    PIP_CMD="pip"
fi

print_success "pip found"

# Step 1: Install Laravel dependencies
print_info "Step 1: Installing Laravel dependencies..."
if [ -f "composer.json" ]; then
    if command -v composer &> /dev/null; then
        composer install --no-dev --optimize-autoloader
        print_success "Composer dependencies installed"
    else
        print_warning "Composer not found, skipping PHP dependencies"
    fi
fi

npm install
print_success "NPM dependencies installed"

# Step 2: Setup environment
print_info "Step 2: Setting up environment..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Environment file created from example"
        
        if command -v php &> /dev/null; then
            php artisan key:generate --no-interaction
            print_success "Application key generated"
        fi
    else
        print_warning "No .env.example found, please create .env manually"
    fi
else
    print_success "Environment file already exists"
fi

# Step 3: Build Laravel frontend
print_info "Step 3: Building Laravel frontend..."
npm run build
print_success "Laravel frontend built"

# Step 4: Setup desktop app
print_info "Step 4: Setting up desktop application..."
cd desktop-app

# Install desktop app dependencies
npm install
print_success "Desktop app dependencies installed"

# Step 5: Build Python service
print_info "Step 5: Building Python service..."
cd ../fastapi/pdf_analyzer

# Install Python requirements
$PIP_CMD install -r requirements.txt
print_success "Python requirements installed"

# Build Python executable
$PYTHON_CMD build_executable.py
if [ $? -eq 0 ]; then
    print_success "Python executable built"
else
    print_error "Failed to build Python executable"
    exit 1
fi

# Step 6: Prepare desktop app assets
print_info "Step 6: Preparing desktop app assets..."
cd ../../desktop-app

# Run build script
node build-script.js
if [ $? -eq 0 ]; then
    print_success "Desktop app assets prepared"
else
    print_error "Failed to prepare desktop app assets"
    exit 1
fi

# Step 7: Configuration
print_info "Step 7: Configuration setup..."
echo ""
print_warning "IMPORTANT: You need to update the server URL configuration!"
echo ""
echo "Please edit the following file:"
echo "  desktop-app/config.js"
echo ""
echo "Change this line:"
echo "  SERVER_URL: 'https://your-laravel-server.com',"
echo ""
echo "To your actual server URL:"
echo "  SERVER_URL: 'https://your-actual-domain.com',"
echo ""

# Step 8: Final instructions
print_info "Setup completed! Next steps:"
echo ""
echo "1. Update server URL in desktop-app/config.js"
echo "2. Test the setup:"
echo "   cd desktop-app"
echo "   npm run dev"
echo ""
echo "3. Build for production:"
echo "   npm run build:win    # For Windows"
echo "   npm run build:mac    # For macOS"
echo "   npm run build:linux  # For Linux"
echo ""
echo "4. Distribute the installer from desktop-app/dist/"
echo ""

print_success "Desktop app setup completed successfully!"
echo ""
print_info "For detailed documentation, see: DESKTOP_APP_SETUP.md"