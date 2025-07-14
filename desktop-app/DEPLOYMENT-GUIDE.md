# Panduan Deployment Desktop App - Mengatasi Deteksi Virus

## Ringkasan Masalah

Desktop app Cetak Cerdas dapat terdeteksi sebagai virus oleh Windows Defender dan antivirus lainnya karena:

1. **Unsigned executable** - Aplikasi belum ditandatangani dengan code signing certificate
2. **Bundled Python executable** - Mengandung file `pdf_analyzer.exe` untuk analisis PDF lokal
3. **NSIS installer** - Installer yang tidak ditandatangani sering dianggap mencurigakan
4. **Electron app** - Framework Electron kadang memicu false positive

## Solusi yang Telah Diterapkan

### 1. Konfigurasi Package.json yang Dioptimalkan

```json
{
  "build": {
    "appId": "com.cetakcerdas.desktop",
    "productName": "Cetak Cerdas",
    "copyright": "Copyright © 2025 Cetak Cerdas",
    "win": {
      "publisherName": "Cetak Cerdas",
      "verifyUpdateCodeSignature": false,
      "requestedExecutionLevel": "asInvoker"
    },
    "nsis": {
      "allowElevation": false,
      "menuCategory": "Office",
      "include": "build/installer.nsh"
    }
  }
}
```

### 2. Custom NSIS Installer Script

File `build/installer.nsh` berisi:
- Metadata aplikasi yang lengkap
- Version information yang proper
- Registry entries untuk identifikasi Windows
- Pesan untuk menambahkan exclusion ke antivirus

### 3. Build Script yang Aman

Gunakan `npm run build:safe` yang:
- Membuat app manifest untuk Windows
- Menambahkan version info resource
- Mengoptimalkan build process
- Memberikan panduan post-build

## Cara Build yang Aman

### 1. Persiapan

```bash
cd desktop-app
npm install
```

### 2. Build dengan Script Aman

```bash
npm run build:safe
```

### 3. Verifikasi Output

Periksa folder `dist/` untuk file installer yang dihasilkan.

## Panduan untuk Pengguna

### Sebelum Distribusi

1. **Buat exclusion di Windows Defender** pada komputer development:
   ```
   Windows Security → Virus & threat protection → Exclusions
   Tambahkan folder: desktop-app/dist/
   ```

2. **Test installer** di komputer yang bersih

3. **Siapkan dokumentasi** untuk pengguna (README-ANTIVIRUS.md)

### Saat Distribusi

1. **Sertakan README-ANTIVIRUS.md** bersama installer
2. **Berikan instruksi jelas** tentang cara menambahkan exclusion
3. **Gunakan platform distribusi terpercaya** (website resmi, tidak melalui email)

## Solusi Jangka Panjang

### 1. Code Signing Certificate

**Sangat Disarankan** untuk mendapatkan code signing certificate:

- **EV Code Signing Certificate** (Extended Validation) - Paling direkomendasikan
- **Standard Code Signing Certificate** - Alternatif yang lebih murah

Provider yang direkomendasikan:
- DigiCert
- Sectigo (Comodo)
- GlobalSign

### 2. Konfigurasi Code Signing

Setelah mendapat certificate, update `package.json`:

```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.p12",
      "certificatePassword": "password",
      "signingHashAlgorithms": ["sha256"],
      "timeStampServer": "http://timestamp.digicert.com"
    }
  }
}
```

### 3. Whitelist Submission

Submit aplikasi ke:
- **Microsoft Defender** - https://www.microsoft.com/en-us/wdsi/filesubmission
- **VirusTotal** - Upload dan monitor detection rates
- **Major antivirus vendors** - Submit false positive reports

## Troubleshooting

### Jika Masih Terdeteksi Virus

1. **Periksa Python executable**:
   ```bash
   # Scan python-service/pdf_analyzer.exe secara terpisah
   # Pastikan tidak ada malware yang sebenarnya
   ```

2. **Rebuild dengan clean environment**:
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build:safe
   ```

3. **Test di multiple antivirus**:
   - Upload ke VirusTotal.com
   - Test dengan berbagai antivirus

### Jika Build Gagal

1. **Periksa dependencies**:
   ```bash
   npm audit
   npm update
   ```

2. **Periksa Python service**:
   ```bash
   # Pastikan pdf_analyzer.exe ada dan berfungsi
   python-service/pdf_analyzer.exe --help
   ```

3. **Periksa icon files**:
   ```bash
   # Pastikan semua icon ada
   ls -la assets/
   ```

## Monitoring dan Maintenance

### 1. Regular Checks

- Monitor detection rates di VirusTotal
- Update dependencies secara berkala
- Test di berbagai versi Windows

### 2. User Feedback

- Siapkan channel untuk laporan false positive
- Dokumentasikan solusi untuk antivirus baru
- Update panduan sesuai feedback

### 3. Version Updates

- Increment version number untuk setiap release
- Update copyright year
- Test compatibility dengan Windows updates

## Kontak dan Support

Untuk masalah deployment atau deteksi virus:
- Email: support@cetakcerdas.com
- Documentation: README-ANTIVIRUS.md
- Build Issues: Periksa log di console saat build

---

**Catatan Penting**: Solusi terbaik adalah mendapatkan code signing certificate. Semua solusi di atas adalah workaround sementara.