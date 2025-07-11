# 🖥️ Desktop Application Setup Guide

Panduan lengkap untuk mengubah aplikasi Laravel Print Management System menjadi aplikasi desktop (.exe) yang dapat diinstall di laptop pengguna.

## 📋 Overview

Aplikasi desktop ini akan:
- ✅ Menjalankan Python PDF analyzer secara lokal (mengurangi beban server)
- ✅ Tetap terhubung ke server Laravel untuk semua fungsi lainnya
- ✅ Memberikan pengalaman aplikasi desktop yang native
- ✅ Mudah diinstall sebagai .exe di Windows, .dmg di macOS, atau .AppImage di Linux

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    Desktop Application                       │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │   Electron      │  │  Python Service  │  │ Proxy Server│ │
│  │   (Frontend)    │  │  (PDF Analyzer)  │  │ (API Bridge)│ │
│  └─────────────────┘  └──────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Laravel Server (Online)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Web Routes  │  │ API Routes  │  │ Desktop App Routes  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Persiapan Environment

```bash
# Clone atau update project
git pull origin main

# Install dependencies Laravel
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate
```

### 2. Build Desktop Application

```bash
# Masuk ke directory desktop app
cd desktop-app

# Windows
build.bat

# macOS/Linux
chmod +x build.sh
./build.sh
```

### 3. Konfigurasi Server URL

Edit file `desktop-app/config.js`:

```javascript
SERVER_URL: 'https://your-actual-server.com', // Ganti dengan URL server Anda
```

### 4. Distribusi

File installer akan tersedia di:
- **Windows**: `desktop-app/dist/Print Management System Setup.exe`
- **macOS**: `desktop-app/dist/Print Management System.dmg`
- **Linux**: `desktop-app/dist/Print Management System.AppImage`

## 📁 File Structure

```
project-root/
├── app/
│   ├── Http/Controllers/
│   │   └── DesktopAppController.php     # Controller untuk desktop app
│   └── Services/
│       └── DesktopAppService.php        # Service untuk desktop app logic
├── config/
│   └── desktop.php                      # Konfigurasi desktop app
├── routes/
│   └── desktop.php                      # Routes khusus desktop app
├── desktop-app/                         # 🆕 Desktop application files
│   ├── src/
│   │   ├── main.js                      # Main Electron process
│   │   └── preload.js                   # Security preload script
│   ├── assets/                          # Application icons
│   ├── frontend-build/                  # Laravel frontend assets
│   ├── python-service/                  # Python executable
│   ├── package.json                     # Electron dependencies
│   ├── config.js                        # Desktop app configuration
│   ├── build-script.js                  # Build preparation script
│   ├── build.bat                        # Windows build script
│   ├── build.sh                         # Unix build script
│   └── README.md                        # Desktop app documentation
└── fastapi/
    └── pdf_analyzer/                    # Python PDF analyzer (existing)
```

## ⚙️ Konfigurasi Detail

### 1. Laravel Server Configuration

#### Update CORS Settings

Edit `config/cors.php`:

```php
'allowed_origins' => [
    'http://localhost:3001',  // Desktop app local server
    'app://*',                // Electron app protocol
    'file://*',               // Local file protocol
],

'allowed_headers' => [
    '*',
    'X-Desktop-App',          // Custom header untuk desktop app
],
```

#### Environment Variables

Tambahkan ke `.env`:

```env
# Desktop App Configuration
DESKTOP_CHECK_UPDATES=true
DESKTOP_LOCAL_PDF_PROCESSING=true
DESKTOP_PYTHON_PORT=9006
DESKTOP_MAX_FILE_SIZE=52428800
DESKTOP_LOGGING_ENABLED=true

# Download URLs (optional)
DESKTOP_DOWNLOAD_URL_WINDOWS=https://your-server.com/downloads/windows
DESKTOP_DOWNLOAD_URL_MAC=https://your-server.com/downloads/mac
DESKTOP_DOWNLOAD_URL_LINUX=https://your-server.com/downloads/linux
```

### 2. Desktop App Configuration

#### Main Configuration (`desktop-app/config.js`)

```javascript
module.exports = {
  SERVER_URL: 'https://your-laravel-server.com',  // 🔥 WAJIB DIUBAH
  LOCAL_PORT: 3001,
  PYTHON_PORT: 9006,
  APP_NAME: 'Print Management System',
  // ... other settings
};
```

#### Package.json Scripts

```json
{
  "scripts": {
    "start": "electron .",
    "dev": "electron . --dev",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac", 
    "build:linux": "electron-builder --linux",
    "dist": "npm run build:frontend && electron-builder"
  }
}
```

## 🔧 Development Workflow

### 1. Development Mode

```bash
# Terminal 1: Laravel development server
php artisan serve

# Terminal 2: Frontend development
npm run dev

# Terminal 3: Desktop app development
cd desktop-app
npm run dev
```

### 2. Testing

```bash
# Test Python service
cd fastapi/pdf_analyzer
python main_hybrid.py --mode server

# Test desktop app
cd desktop-app
npm start
```

### 3. Building for Production

```bash
# Full build process
cd desktop-app
node build-script.js  # Prepare assets
npm install           # Install dependencies
npm run dist          # Build desktop app
```

## 📦 Distribution Strategy

### 1. Manual Distribution

1. Build aplikasi untuk platform target
2. Upload installer ke server/cloud storage
3. Berikan link download ke pengguna
4. Pengguna download dan install manual

### 2. Automated Distribution (Recommended)

1. Setup CI/CD pipeline (GitHub Actions, etc.)
2. Automated build untuk multiple platforms
3. Upload ke release repository
4. Auto-update mechanism (future enhancement)

### 3. Enterprise Distribution

1. Package dengan MSI (Windows) atau PKG (macOS)
2. Code signing untuk security
3. Group Policy deployment (Windows)
4. MDM deployment (macOS)

## 🛡️ Security Considerations

### 1. Code Signing

```bash
# Windows (requires certificate)
electron-builder --win --publish=never

# macOS (requires Apple Developer account)
electron-builder --mac --publish=never
```

### 2. Auto-Update Security

```javascript
// Implement secure auto-updater
const { autoUpdater } = require('electron-updater');
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'your-username',
  repo: 'your-repo',
  private: true
});
```

### 3. API Security

```php
// Middleware untuk validasi desktop app
class DesktopAppMiddleware
{
    public function handle($request, Closure $next)
    {
        if (!$this->isValidDesktopApp($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        return $next($request);
    }
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Python Service Tidak Start

```bash
# Check executable permissions
chmod +x desktop-app/python-service/pdf_analyzer

# Test manual
./desktop-app/python-service/pdf_analyzer --mode server --port 9006
```

#### 2. CORS Errors

```php
// Add to config/cors.php
'allowed_origins' => ['*'], // For development only
'supports_credentials' => true,
```

#### 3. Build Failures

```bash
# Clear cache and rebuild
rm -rf desktop-app/node_modules
rm -rf desktop-app/dist
npm install
npm run dist
```

#### 4. Large File Size

```javascript
// Optimize build in package.json
"build": {
  "compression": "maximum",
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true
  }
}
```

## 📊 Performance Optimization

### 1. Bundle Size Optimization

```javascript
// webpack.config.js (if needed)
module.exports = {
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all'
    }
  }
};
```

### 2. Python Service Optimization

```python
# Optimize PDF processing
def analyze_doc(file_bytes, color_threshold=10.0, photo_threshold=50.0):
    # Use multiprocessing for large files
    with ProcessPoolExecutor(max_workers=2) as executor:
        # ... processing logic
```

### 3. Memory Management

```javascript
// main.js - Optimize memory usage
app.commandLine.appendSwitch('--max-old-space-size', '4096');
app.commandLine.appendSwitch('--js-flags', '--max-old-space-size=4096');
```

## 🔄 Update Mechanism

### 1. Manual Updates

```javascript
// Check for updates
const updateInfo = await fetch(`${SERVER_URL}/desktop/check-updates`, {
  method: 'POST',
  body: JSON.stringify({ version: app.getVersion() })
});
```

### 2. Auto Updates (Future)

```javascript
// electron-updater implementation
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();
autoUpdater.on('update-available', () => {
  // Show update notification
});
```

## 📈 Monitoring & Analytics

### 1. Error Reporting

```javascript
// Report errors to server
window.electronAPI.reportError({
  error_type: 'pdf_processing',
  error_message: error.message,
  stack_trace: error.stack,
  app_version: app.getVersion()
});
```

### 2. Usage Analytics

```php
// Track desktop app usage
class DesktopAppController extends Controller
{
    public function logActivity(Request $request)
    {
        DesktopAppActivity::create([
            'user_id' => auth()->id(),
            'action' => $request->action,
            'metadata' => $request->metadata,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);
    }
}
```

## 🎯 Next Steps

1. **Immediate**:
   - Update `SERVER_URL` di konfigurasi
   - Test build process
   - Deploy ke test environment

2. **Short Term**:
   - Implement code signing
   - Setup automated builds
   - Create user documentation

3. **Long Term**:
   - Auto-update mechanism
   - Advanced analytics
   - Multi-language support
   - Offline mode capabilities

## 📞 Support

Untuk pertanyaan dan dukungan:
- 📧 Email: [your-email@domain.com]
- 💬 Slack: #desktop-app-support
- 📖 Documentation: [link-to-docs]

---

**🎉 Selamat! Aplikasi desktop Anda siap untuk didistribusikan!**