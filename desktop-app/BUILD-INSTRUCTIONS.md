# Build Instructions - Mengatasi Deteksi Virus

## Quick Build (Recommended)

### Untuk macOS (Mengatasi Parallels VM Error):

```bash
cd desktop-app

# Test konfigurasi
npm run test:build

# Build sederhana (tanpa VM)
npm run build:simple

# Verifikasi hasil
npm run verify
```

### Untuk Windows/Linux:

```bash
cd desktop-app

# Test konfigurasi
npm run test:build

# Build dengan optimasi
npm run build:safe

# Verifikasi hasil
npm run verify

# Atau jalankan semua sekaligus
npm run build:complete
```

## Manual Build

```bash
# Install dependencies
npm install

# Build frontend
npm run build:frontend

# Build Windows installer
npm run build:win
```

## Konfigurasi Anti-Virus yang Sudah Diterapkan

### 1. Package.json Optimizations
- ✅ Publisher name: "Cetak Cerdas"
- ✅ Copyright: "Copyright © 2025 Cetak Cerdas"
- ✅ Execution level: "asInvoker" (tidak perlu admin)
- ✅ File associations untuk PDF
- ✅ Proper app metadata

### 2. NSIS Installer Settings
- ✅ `allowElevation: false` - Tidak meminta admin rights
- ✅ `menuCategory: "Office"` - Kategori yang aman
- ✅ `deleteAppDataOnUninstall: true` - Clean uninstall
- ✅ Proper icon configuration

### 3. Build Optimizations
- ✅ Compression: normal (tidak terlalu agresif)
- ✅ Remove package scripts
- ✅ Build dependencies from source: false
- ✅ Exclude cache dan map files

## Hasil Build

Setelah build berhasil, file installer akan ada di:
```
dist/Cetak Cerdas-Setup-1.0.0.exe
```

## Jika Masih Terdeteksi Virus

### Untuk Developer:
1. Tambahkan folder `dist/` ke Windows Defender exclusions
2. Submit file ke VirusTotal untuk analysis
3. Report false positive ke Microsoft

### Untuk End Users:
1. Baca [`README-ANTIVIRUS.md`](README-ANTIVIRUS.md)
2. Tambahkan folder instalasi ke antivirus exclusions
3. Download dari sumber terpercaya

## Solusi Jangka Panjang

1. **Code Signing Certificate** (Sangat Disarankan)
   - EV Code Signing Certificate dari DigiCert/Sectigo
   - Eliminates most false positives
   - Cost: ~$300-500/year

2. **Whitelist Submission**
   - Submit ke Microsoft Defender
   - Submit ke major antivirus vendors
   - Monitor VirusTotal detection rates

3. **Alternative Distribution**
   - Microsoft Store (requires code signing)
   - Chocolatey package manager
   - Direct download dengan clear instructions

## Troubleshooting

### Parallels VM Error (macOS)
```
Error: spawn prlctl ENOENT
```

**Solusi:**
```bash
# Gunakan build simple yang tidak menggunakan VM
npm run build:simple

# Atau set environment variable
export FORCE_LOCAL_BUILD=true
npm run build:win
```

### Build Fails
```bash
# Clean dan rebuild
rm -rf node_modules dist
npm install
npm run build:complete
```

### Python Service Issues
```bash
# Verify Python service exists
ls -la python-service/
```

### Icon Issues
```bash
# Verify icons exist
ls -la assets/
```

### NSIS Script Conflicts
```
Error: VIProductVersion already defined!
```

**Solusi:** Konfigurasi sudah diperbaiki untuk menghindari konflik dengan electron-builder built-in variables.

## Support

- Email: support@cetakcerdas.com
- Documentation: README-ANTIVIRUS.md
- Build Issues: Check console output