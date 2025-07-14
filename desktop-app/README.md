# Cetak Cerdas Desktop App

Desktop application untuk sistem manajemen cetak dengan kemampuan analisis PDF lokal.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm atau yarn
- Python service (sudah termasuk dalam bundle)

### Installation

```bash
# Clone repository
git clone [repository-url]
cd desktop-app

# Install dependencies
npm install

# Build frontend
npm run build:frontend

# Start development
npm run dev
```

## 📦 Building for Production

### Build Aman (Recommended)

```bash
# Build dengan optimasi anti-virus
npm run build:safe

# Verifikasi build
npm run verify

# Build lengkap dengan verifikasi
npm run build:complete
```

### Build Manual

```bash
# Windows
npm run build:win

# macOS  
npm run build:mac

# Linux
npm run build:linux
```

## 🛡️ Mengatasi Deteksi Virus

**PENTING**: Desktop app mungkin terdeteksi sebagai virus oleh Windows Defender atau antivirus lainnya.

### Penyebab

- ✅ Aplikasi **AMAN** - tidak mengandung virus
- ❌ Belum ditandatangani dengan code signing certificate
- ❌ Mengandung Python executable untuk analisis PDF
- ❌ Framework Electron kadang memicu false positive

### Solusi Cepat

1. **Tambahkan exclusion** di Windows Defender:
   ```
   Windows Security → Virus & threat protection → Exclusions
   Tambahkan folder: desktop-app/dist/
   ```

2. **Baca panduan lengkap**: [`README-ANTIVIRUS.md`](README-ANTIVIRUS.md)

3. **Untuk deployment**: [`DEPLOYMENT-GUIDE.md`](DEPLOYMENT-GUIDE.md)

## 🏗️ Struktur Project

```
desktop-app/
├── src/
│   ├── main.js          # Main Electron process
│   └── preload.js       # Preload script
├── assets/
│   ├── icon.ico         # Windows icon
│   ├── icon.icns        # macOS icon
│   └── icon.png         # Linux icon
├── python-service/
│   └── pdf_analyzer.exe # Python service untuk analisis PDF
├── frontend-build/      # Built Laravel frontend
├── build/
│   ├── installer.nsh    # Custom NSIS installer script
│   ├── app.manifest     # Windows app manifest
│   └── version.rc       # Version resource
├── build-safe.js        # Script build yang aman
├── verify-build.js      # Script verifikasi build
└── dist/               # Output build
```

## ⚙️ Konfigurasi

### Environment Variables

```bash
# Development
SERVER_URL=http://localhost:8000

# Production  
SERVER_URL=https://cetakcerdas.com
```

### Build Configuration

Konfigurasi build ada di [`package.json`](package.json) section `build`:

- **Windows**: NSIS installer dengan metadata lengkap
- **macOS**: DMG dengan code signing disabled
- **Linux**: AppImage

## 🔧 Development

### Scripts Available

```bash
npm run start          # Start production app
npm run dev           # Start development with DevTools
npm run build:safe    # Build dengan optimasi anti-virus
npm run verify        # Verifikasi build output
npm run build:complete # Build + verifikasi
```

### Debugging

```bash
# Development mode dengan DevTools
npm run dev

# Check logs
# Windows: %APPDATA%/Cetak Cerdas/logs/
# macOS: ~/Library/Logs/Cetak Cerdas/
# Linux: ~/.config/Cetak Cerdas/logs/
```

## 🐛 Troubleshooting

### Build Issues

1. **Python service not found**:
   ```bash
   # Pastikan file ada
   ls -la python-service/pdf_analyzer.exe
   ```

2. **Icon files missing**:
   ```bash
   # Pastikan semua icon ada
   ls -la assets/
   ```

3. **Frontend build failed**:
   ```bash
   # Build manual
   cd ..
   npm run build
   cd desktop-app
   ```

### Runtime Issues

1. **App tidak start**:
   - Periksa console untuk error
   - Pastikan port 3001 dan 9007 tidak digunakan
   - Restart dengan `npm run dev`

2. **PDF analysis tidak bekerja**:
   - Python service mungkin tidak start
   - Fallback ke online service otomatis
   - Periksa log di DevTools

### Antivirus Issues

1. **Installer terdeteksi virus**:
   - Baca [`README-ANTIVIRUS.md`](README-ANTIVIRUS.md)
   - Tambahkan exclusion di antivirus
   - Submit false positive report

2. **App tidak bisa dijalankan**:
   - Tambahkan folder instalasi ke exclusion
   - Disable real-time protection sementara
   - Install ulang setelah exclusion ditambahkan

## 📋 Deployment Checklist

- [ ] Build dengan `npm run build:safe`
- [ ] Verifikasi dengan `npm run verify`
- [ ] Test di komputer bersih
- [ ] Siapkan [`README-ANTIVIRUS.md`](README-ANTIVIRUS.md) untuk user
- [ ] Upload ke platform distribusi terpercaya
- [ ] Monitor feedback false positive

## 🔮 Roadmap

### Short Term
- [ ] Code signing certificate
- [ ] Auto-updater
- [ ] Improved error handling

### Long Term  
- [ ] Multi-language support
- [ ] Plugin system
- [ ] Cloud sync

## 📞 Support

- **Email**: support@cetakcerdas.com
- **Website**: https://cetakcerdas.com
- **Issues**: [GitHub Issues]
- **Documentation**: [`DEPLOYMENT-GUIDE.md`](DEPLOYMENT-GUIDE.md)

## 📄 License

Copyright © 2025 Cetak Cerdas. All rights reserved.

---

**⚠️ Catatan Penting**: Untuk menghindari deteksi virus, selalu gunakan `npm run build:safe` dan ikuti panduan di [`README-ANTIVIRUS.md`](README-ANTIVIRUS.md).