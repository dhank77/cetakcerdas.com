# Panduan Mengatasi Deteksi Antivirus

## Mengapa Aplikasi Terdeteksi sebagai Virus?

Aplikasi desktop Cetak Cerdas mungkin terdeteksi sebagai "virus" oleh beberapa program antivirus karena:

1. **Aplikasi belum ditandatangani secara digital** - Kami sedang dalam proses mendapatkan sertifikat code signing
2. **Mengandung executable Python** - Untuk analisis PDF lokal
3. **Aplikasi Electron yang baru** - Belum dikenal oleh database antivirus

## Cara Mengatasi

### Windows Defender

1. Buka **Windows Security** (Windows Defender)
2. Pilih **Virus & threat protection**
3. Klik **Manage settings** di bawah "Virus & threat protection settings"
4. Scroll ke bawah dan klik **Add or remove exclusions**
5. Klik **Add an exclusion** → **Folder**
6. Pilih folder instalasi aplikasi (biasanya `C:\Users\[Username]\AppData\Local\Programs\Cetak Cerdas`)

### Antivirus Lainnya

#### Avast
1. Buka Avast → **Menu** → **Settings**
2. Pilih **General** → **Exceptions**
3. Klik **Add Exception** → **Folder**
4. Pilih folder instalasi aplikasi

#### AVG
1. Buka AVG → **Menu** → **Settings**
2. Pilih **Components** → **Web Shield**
3. Klik **Exceptions** → **Add Exception**
4. Pilih folder instalasi aplikasi

#### McAfee
1. Buka McAfee → **PC Security** → **Real-Time Scanning**
2. Klik **Excluded Files**
3. Klik **Add file** atau **Add folder**
4. Pilih folder instalasi aplikasi

#### Norton
1. Buka Norton → **Settings** → **Antivirus**
2. Pilih **Scans and Risks** → **Exclusions/Low Risks**
3. Klik **Configure** → **Add**
4. Pilih folder instalasi aplikasi

## Verifikasi Keamanan

Aplikasi ini aman karena:

- ✅ **Open Source** - Kode sumber dapat diperiksa
- ✅ **Tidak mengakses data sensitif** - Hanya memproses file PDF untuk analisis
- ✅ **Tidak terhubung ke server mencurigakan** - Hanya ke cetakcerdas.com
- ✅ **Tidak memodifikasi sistem** - Berjalan dengan hak akses user biasa

## Alternatif Solusi

Jika masih mengalami masalah:

1. **Gunakan versi web** di https://cetakcerdas.com
2. **Sementara nonaktifkan antivirus** saat instalasi (tidak disarankan)
3. **Hubungi support** untuk bantuan lebih lanjut

## Kontak Support

- Email: support@cetakcerdas.com
- Website: https://cetakcerdas.com
- WhatsApp: [Nomor WhatsApp Support]

---

**Catatan**: Kami sedang dalam proses mendapatkan sertifikat code signing untuk menghilangkan peringatan ini di versi mendatang.