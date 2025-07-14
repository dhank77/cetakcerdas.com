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

#### Bkav Pro
**Deteksi**: W32.AIDetectMalware (False Positive)
1. Buka Bkav Pro → **Cài đặt** (Settings)
2. Pilih **Bảo vệ thời gian thực** (Real-time Protection)
3. Klik **Ngoại lệ** (Exceptions) atau **Loại trừ** (Exclusions)
4. Klik **Thêm thư mục** (Add Folder)
5. Pilih folder instalasi aplikasi
6. Klik **Áp dụng** (Apply)

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

## Mengapa Terjadi False Positive?

**Bkav Pro W32.AIDetectMalware** dan deteksi serupa terjadi karena:

1. **AI Detection** - Antivirus menggunakan AI yang belum mengenal pola aplikasi Electron + PyInstaller
2. **Executable Packing** - PyInstaller membuat executable yang "packed" yang sering dicurigai
3. **Network Interception** - Aplikasi melakukan intercept request HTTP yang terlihat mencurigakan
4. **Unsigned Binary** - Aplikasi belum memiliki code signing certificate

## Statistik Deteksi

- **Total Engine**: 69 antivirus engines
- **Terdeteksi**: 1 engine (Bkav Pro)
- **False Positive Rate**: 1.4% (sangat rendah)
- **Status**: Aman untuk digunakan

## Verifikasi Keamanan

Aplikasi ini aman karena:

- ✅ **Open Source** - Kode sumber dapat diperiksa di GitHub
- ✅ **Tidak mengakses data sensitif** - Hanya memproses file PDF untuk analisis
- ✅ **Tidak terhubung ke server mencurigakan** - Hanya ke cetakcerdas.com
- ✅ **Tidak memodifikasi sistem** - Berjalan dengan hak akses user biasa
- ✅ **Scan VirusTotal** - 68/69 engines menganggap aman

## Mengurangi False Positive (Untuk Developer)

Langkah-langkah yang sedang dilakukan untuk mengurangi deteksi:

1. **Code Signing Certificate** - Sedang dalam proses pembelian
2. **Whitelist Submission** - Submit aplikasi ke vendor antivirus
3. **Build Optimization** - Menggunakan build flags yang lebih aman
4. **Gradual Rollout** - Release bertahap untuk membangun reputasi

## Melaporkan False Positive

Jika Anda yakin ini false positive, laporkan ke:

### Bkav Pro
- Website: https://www.bkav.com.vn/support/false-positive-report
- Email: support@bkav.com.vn
- Sertakan: File aplikasi dan penjelasan bahwa ini adalah aplikasi legitimate

### VirusTotal
- Upload file ke https://www.virustotal.com
- Klik "Request re-analysis" jika sudah ada
- Vendor akan otomatis mendapat notifikasi

## Alternatif Solusi

Jika masih mengalami masalah:

1. **Gunakan versi web** di https://cetakcerdas.com
2. **Tambahkan exception** di antivirus (recommended)
3. **Sementara nonaktifkan antivirus** saat instalasi (tidak disarankan)
4. **Hubungi support** untuk bantuan lebih lanjut

## Kontak Support

- Email: support@cetakcerdas.com
- Website: https://cetakcerdas.com
- WhatsApp: [Nomor WhatsApp Support]

---

**Catatan**:
- False positive rate 1.4% (1/69) adalah sangat rendah dan normal untuk aplikasi baru
- Kami sedang dalam proses mendapatkan sertifikat code signing untuk menghilangkan peringatan ini di versi mendatang
- Aplikasi telah diverifikasi aman oleh 68 dari 69 antivirus engines