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
# Build dengan optimasi anti-virus (enhanced)
npm run build:antivirus-safe

# Build standard dengan optimasi
npm run build:safe

# Verifikasi build
npm run verify

# Build production dengan verifikasi
npm run build:production
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

## 🛡️ Status Keamanan Antivirus

**Status Saat Ini**: ✅ **68/69 engines AMAN** (98.6% clean rate)

### Deteksi False Positive
- **Bkav Pro**: W32.AIDetectMalware (AI detection error)
- **Status**: False positive - aplikasi 100% aman
- **Penyebab**: AI detection yang salah mengidentifikasi pola Electron + PyInstaller

### Mengapa Terjadi False Positive?

- ✅ Aplikasi **AMAN** - tidak mengandung virus atau malware
- ❌ Belum ditandatangani dengan code signing certificate
- ❌ Mengandung Python executable untuk analisis PDF lokal
- ❌ Framework Electron + PyInstaller sering memicu AI detection
- ❌ Network interception untuk analisis lokal terlihat mencurigakan

### Solusi Cepat

1. **Bkav Pro Users**:
   ```
   Bkav Pro → Cài đặt → Bảo vệ thời gian thực → Ngoại lệ
   Thêm thư mục instalasi aplikasi
   ```

2. **Windows Defender**:
   ```
   Windows Security → Virus & threat protection → Exclusions
   Tambahkan folder: C:\Users\[Username]\AppData\Local\Programs\Cetak Cerdas
   ```

3. **Panduan Lengkap**:
   - 📖 **User Guide**: [`README-ANTIVIRUS.md`](README-ANTIVIRUS.md)
   - 🛠️ **Technical Solution**: [`ANTIVIRUS-SOLUTION.md`](ANTIVIRUS-SOLUTION.md)
   - 📝 **Report Template**: [`FALSE-POSITIVE-REPORT.md`](FALSE-POSITIVE-REPORT.md)

4. **Untuk Deployment**: [`DEPLOYMENT-GUIDE.md`](DEPLOYMENT-GUIDE.md)

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
SERVER_URL=http://print.test

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
npm run start                # Start production app
npm run dev                 # Start development with DevTools
npm run build:antivirus-safe # Build dengan optimasi anti-virus enhanced
npm run build:safe          # Build dengan optimasi anti-virus standard
npm run verify              # Verifikasi build output
npm run build:production    # Build production + verifikasi
npm run build:complete      # Build + verifikasi (legacy)
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

### Pre-Build
- [ ] Update version di `package.json`
- [ ] Test aplikasi di development mode
- [ ] Pastikan Python service berfungsi

### Build Process
- [ ] Build dengan `npm run build:antivirus-safe` (recommended)
- [ ] Verifikasi dengan `npm run verify`
- [ ] Test installer di komputer bersih
- [ ] Scan dengan VirusTotal

### Documentation
- [ ] Siapkan [`README-ANTIVIRUS.md`](README-ANTIVIRUS.md) untuk user
- [ ] Update [`FALSE-POSITIVE-REPORT.md`](FALSE-POSITIVE-REPORT.md) jika ada deteksi baru
- [ ] Dokumentasikan perubahan di changelog

### Distribution
- [ ] Upload ke platform distribusi terpercaya
- [ ] Sertakan dokumentasi antivirus
- [ ] Monitor feedback false positive
- [ ] Siapkan response plan jika detection rate meningkat

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

**⚠️ Catatan Penting**:
- **False Positive Rate**: 1.4% (1/69 engines) - sangat rendah dan normal
- **Build Production**: Gunakan `npm run build:antivirus-safe` untuk hasil terbaik
- **Jika Terdeteksi**: Ikuti panduan di [`README-ANTIVIRUS.md`](README-ANTIVIRUS.md)
- **Laporan False Positive**: Gunakan template di [`FALSE-POSITIVE-REPORT.md`](FALSE-POSITIVE-REPORT.md)
- **Solusi Teknis**: Baca [`ANTIVIRUS-SOLUTION.md`](ANTIVIRUS-SOLUTION.md) untuk developer