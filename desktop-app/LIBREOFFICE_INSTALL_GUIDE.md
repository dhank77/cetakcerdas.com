# 📖 Panduan Instalasi LibreOffice untuk Pencetakan DOCX

Untuk mencetak file DOCX dengan optimal di aplikasi CetakCerdas Desktop, Anda perlu menginstall LibreOffice (gratis) atau Microsoft Word.

## 🆓 Opsi 1: LibreOffice (Gratis & Direkomendasikan)

### Instalasi di macOS

#### Metode 1: Download Langsung
1. **Kunjungi website resmi**: https://www.libreoffice.org/download/download/
2. **Pilih macOS** dari daftar sistem operasi
3. **Download file installer** (.dmg)
4. **Buka file .dmg** yang sudah didownload
5. **Drag LibreOffice** ke folder Applications
6. **Restart aplikasi CetakCerdas** setelah instalasi selesai

#### Metode 2: Homebrew (untuk pengguna advanced)
```bash
# Install Homebrew jika belum ada
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install LibreOffice
brew install --cask libreoffice
```

### Instalasi di Windows
1. **Download dari**: https://www.libreoffice.org/download/download/
2. **Pilih Windows** (32-bit atau 64-bit sesuai sistem)
3. **Jalankan installer** dan ikuti petunjuk
4. **Restart aplikasi CetakCerdas** setelah instalasi

### Instalasi di Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install libreoffice

# CentOS/RHEL/Fedora
sudo yum install libreoffice
# atau untuk Fedora yang lebih baru:
sudo dnf install libreoffice
```

## 💰 Opsi 2: Microsoft Word (Berbayar)

### Microsoft 365
1. **Kunjungi**: https://www.microsoft.com/microsoft-365
2. **Pilih paket** yang sesuai
3. **Download dan install** Microsoft Office
4. **Restart aplikasi CetakCerdas** setelah instalasi

### Microsoft Word Standalone
1. **Beli lisensi** Microsoft Word
2. **Download dari Microsoft Store** atau website resmi
3. **Install dan aktivasi**
4. **Restart aplikasi CetakCerdas**

## ✅ Verifikasi Instalasi

Setelah menginstall LibreOffice atau Microsoft Word:

1. **Restart aplikasi CetakCerdas Desktop**
2. **Coba upload file DOCX**
3. **Klik "Tambah ke Keranjang & Cetak"**
4. **File seharusnya otomatis dikonversi ke PDF** dan siap dicetak

## 🔧 Troubleshooting

### LibreOffice Tidak Terdeteksi
Jika masih muncul pesan error setelah instalasi:

1. **Pastikan LibreOffice terinstall** di lokasi standar:
   - macOS: `/Applications/LibreOffice.app/`
   - Windows: `C:\Program Files\LibreOffice\`
   - Linux: `/usr/bin/soffice`

2. **Restart komputer** setelah instalasi

3. **Coba buka LibreOffice manual** untuk memastikan berfungsi

4. **Restart aplikasi CetakCerdas Desktop**

### Masih Bermasalah?

Jika masih mengalami masalah:

1. **Gunakan fitur Preview DOCX** untuk melihat isi dokumen
2. **Copy-paste konten** ke aplikasi word processor lain
3. **Konversi manual** DOCX ke PDF menggunakan aplikasi lain
4. **Hubungi support** untuk bantuan lebih lanjut

## 🎯 Keuntungan Menggunakan LibreOffice

- ✅ **Gratis dan open source**
- ✅ **Kompatibel dengan format Microsoft Office**
- ✅ **Ringan dan cepat**
- ✅ **Mendukung banyak format file**
- ✅ **Terintegrasi dengan aplikasi CetakCerdas**
- ✅ **Konversi otomatis DOCX ke PDF**
- ✅ **Kualitas cetak yang baik**

## 📞 Bantuan

Jika mengalami kesulitan dalam instalasi atau penggunaan:
- **Email**: support@cetakcerdas.com
- **WhatsApp**: +62-xxx-xxxx-xxxx
- **Website**: https://cetakcerdas.com/support

---

**Catatan**: Setelah menginstall LibreOffice atau Microsoft Word, aplikasi CetakCerdas akan otomatis mendeteksi dan menggunakan aplikasi tersebut untuk konversi DOCX ke PDF, memberikan hasil cetak yang optimal.