# Print Management System - Desktop Application

Desktop application untuk sistem manajemen print yang menjalankan Python service secara lokal untuk mengurangi beban server, sambil tetap terhubung ke server utama untuk semua fungsi lainnya.

## 🎯 Tujuan

- **Python Lokal**: Menjalankan PDF analyzer secara lokal untuk mengurangi beban server
- **Online Connection**: Tetap terhubung ke server Laravel untuk semua fungsi lainnya
- **Desktop Experience**: Memberikan pengalaman aplikasi desktop yang native
- **Easy Installation**: Mudah diinstall sebagai .exe di laptop pengguna

## 🏗️ Arsitektur

```
Desktop App (Electron)
├── Frontend (Laravel Build)
├── Python Service (Local PDF Analyzer)
└── Proxy Server (Connect to Main Laravel Server)
```

## 📋 Prerequisites

### Untuk Development:
- Node.js 18+ 
- Python 3.8+
- npm atau yarn

### Untuk Building:
- Semua requirements di atas
- PyInstaller (untuk Python executable)
- Electron Builder

## 🚀 Setup Development

### 1. Install Dependencies

```bash
# Install Node.js dependencies
cd desktop-app
npm install

# Install Python dependencies
cd ../fastapi/pdf_analyzer
pip install -r requirements.txt
```

### 2. Configure Server URL

Edit file [`config.js`](config.js) dan ubah `SERVER_URL`:

```javascript
SERVER_URL: 'https://your-actual-laravel-server.com',
```

### 3. Build Laravel Frontend

```bash
# Dari root directory Laravel
npm run build
```

### 4. Run Development Mode

```bash
# Dari desktop-app directory
npm run dev
```

## 🔨 Building for Production

### 1. Automated Build

```bash
# Dari desktop-app directory
node build-script.js
```

Script ini akan:
- Build Laravel frontend
- Copy assets ke desktop app
- Build Python executable
- Create application icons

### 2. Install Dependencies

```bash
npm install
```

### 3. Build Desktop App

```bash
# Build untuk Windows
npm run build:win

# Build untuk macOS
npm run build:mac

# Build untuk Linux
npm run build:linux

# Build untuk semua platform
npm run dist
```

## 📁 Struktur File

```
desktop-app/
├── src/
│   ├── main.js          # Main Electron process
│   └── preload.js       # Preload script untuk security
├── assets/              # Application icons
├── frontend-build/      # Laravel frontend assets
├── python-service/      # Python executable
├── package.json         # Node.js dependencies
├── config.js           # Application configuration
├── build-script.js     # Build preparation script
└── README.md           # Documentation
```

## ⚙️ Configuration

### Environment Variables

Buat file `.env` di directory `desktop-app`:

```env
SERVER_URL=https://your-laravel-server.com
PYTHON_PORT=9006
LOCAL_PORT=3001
LOG_LEVEL=info
```

### Laravel Server Configuration

Pastikan server Laravel Anda mengizinkan CORS dari desktop app:

```php
// config/cors.php
'allowed_origins' => [
    'http://localhost:3001',
    'app://*', // Untuk Electron
],
```

## 🔧 Troubleshooting

### Python Service Tidak Start

1. Pastikan Python executable ada di `python-service/`
2. Check permissions (Unix: `chmod +x python-service/pdf_analyzer`)
3. Test manual: `./python-service/pdf_analyzer --mode server`

### Frontend Tidak Load

1. Pastikan `SERVER_URL` sudah benar di `config.js`
2. Check network connection
3. Verify CORS settings di server Laravel

### Build Gagal

1. Pastikan semua dependencies terinstall
2. Check Python dan Node.js versions
3. Run `node build-script.js` untuk debug

## 📦 Distribution

### Windows (.exe)

File installer akan dibuat di `dist/Print Management System Setup.exe`

### macOS (.dmg)

File installer akan dibuat di `dist/Print Management System.dmg`

### Linux (.AppImage)

File executable akan dibuat di `dist/Print Management System.AppImage`

## 🔄 Update Process

### Manual Update
1. Download installer baru
2. Uninstall versi lama
3. Install versi baru

### Auto Update (Future)
- Implementasi auto-updater menggunakan `electron-updater`
- Server update terpisah untuk distribusi updates

## 🛡️ Security

- **No Node Integration**: Frontend tidak memiliki akses langsung ke Node.js
- **Context Isolation**: Renderer process terisolasi
- **Preload Script**: API terbatas melalui preload script
- **HTTPS Only**: Semua komunikasi ke server menggunakan HTTPS

## 📊 Performance

### Optimizations
- **Local PDF Processing**: Mengurangi beban server
- **Asset Caching**: Frontend assets di-cache lokal
- **Lazy Loading**: Load components sesuai kebutuhan

### Resource Usage
- **Memory**: ~100-200MB (tergantung usage)
- **Disk**: ~150-300MB (termasuk Python runtime)
- **CPU**: Minimal saat idle, tinggi saat PDF processing

## 🐛 Known Issues

1. **First Launch Slow**: Python service butuh waktu untuk start
2. **Large PDF Files**: Memory usage tinggi untuk file besar
3. **Network Dependency**: Butuh internet untuk fungsi utama

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

[Your License Here]

## 📞 Support

Untuk support dan bug reports:
- Email: [your-email@domain.com]
- Issues: [GitHub Issues URL]

---

## 🚀 Quick Start Commands

```bash
# Setup
git clone [repository]
cd desktop-app
npm install
node build-script.js

# Development
npm run dev

# Production Build
npm run dist

# Test Python Service
./python-service/pdf_analyzer --mode server