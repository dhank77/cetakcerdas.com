# Migrasi dari reCAPTCHA v3 ke reCAPTCHA v2

Dokumentasi ini menjelaskan perubahan yang telah dilakukan untuk mengganti reCAPTCHA v3 dengan reCAPTCHA v2 menggunakan package `anhskohbo/no-captcha`.

## Perubahan yang Dilakukan

### 1. Package Dependencies
- **Dihapus**: `josiasmontag/laravel-recaptchav3`
- **Ditambah**: `anhskohbo/no-captcha`

### 2. Konfigurasi
- **Dihapus**: `config/recaptchav3.php`
- **Ditambah**: `config/captcha.php`
- **Diperbarui**: `.env.example` dengan variabel baru:
  ```
  NOCAPTCHA_SITEKEY=your_site_key_here
  NOCAPTCHA_SECRET=your_secret_key_here
  ```

### 3. Frontend Changes

#### File yang Diperbarui:
- `resources/views/app.blade.php`
- `resources/js/pages/auth/login.tsx`
- `resources/js/pages/auth/register.tsx`

#### Perubahan Utama:
- Menghapus script reCAPTCHA v3 invisible
- Menambah widget reCAPTCHA v2 yang terlihat
- Menggunakan `useRef` dan `useEffect` untuk inisialisasi widget
- Menambah meta tag `captcha-sitekey` untuk akses dari JavaScript

### 4. Backend Validation

#### File yang Diperbarui:
- `app/Http/Controllers/Auth/RegisteredUserController.php`
- `app/Http/Requests/Auth/LoginRequest.php`

#### Perubahan Validasi:
- Mengganti rule `recaptchav3:action,threshold` dengan `captcha`
- Validasi reCAPTCHA hanya aktif di environment production
- Di environment development, field `g-recaptcha-response` bersifat nullable

## Cara Setup

### 1. Environment Variables
Tambahkan ke file `.env`:
```
NOCAPTCHA_SITEKEY=your_actual_site_key
NOCAPTCHA_SECRET=your_actual_secret_key
```

### 2. Mendapatkan Keys reCAPTCHA v2
1. Kunjungi [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin)
2. Buat site baru dengan tipe "reCAPTCHA v2" → "I'm not a robot" Checkbox
3. Masukkan domain website Anda
4. Copy Site Key dan Secret Key ke file `.env`

### 3. Testing
- **Development**: reCAPTCHA dinonaktifkan, form akan berfungsi tanpa validasi captcha
- **Production**: reCAPTCHA aktif dan wajib diisi

## Perbedaan reCAPTCHA v2 vs v3

| Aspek | reCAPTCHA v2 | reCAPTCHA v3 |
|-------|--------------|---------------|
| User Interaction | Checkbox "I'm not a robot" | Invisible, no interaction |
| User Experience | Memerlukan klik user | Seamless |
| Bot Detection | Challenge-response | Risk score (0.0-1.0) |
| Implementation | Widget visible | Background execution |
| Fallback | CAPTCHA challenge jika suspicious | Hanya score, no fallback |

## Troubleshooting

### Widget tidak muncul
1. Pastikan `NOCAPTCHA_SITEKEY` sudah diset di `.env`
2. Periksa console browser untuk error JavaScript
3. Pastikan domain sudah terdaftar di Google reCAPTCHA Console

### Validasi gagal
1. Pastikan `NOCAPTCHA_SECRET` sudah diset di `.env`
2. Periksa apakah user sudah mencentang checkbox reCAPTCHA
3. Di development, pastikan `APP_ENV=local` agar validasi dilewati

### Error "ip() method not found"
Ini adalah limitation dari diagnostic mode. Method `ip()` tersedia di runtime Laravel tetapi tidak dikenali oleh static analysis tools.

## Keamanan

reCAPTCHA v2 memberikan keamanan yang baik dengan:
- User verification melalui checkbox interaction
- CAPTCHA challenge untuk suspicious behavior
- Rate limiting tetap aktif di level aplikasi
- Environment-based validation (production only)

Untuk keamanan maksimal, pastikan:
1. Secret key tidak pernah di-expose ke frontend
2. Validasi server-side selalu aktif di production
3. Rate limiting dikonfigurasi dengan benar
4. Domain restrictions diset di Google reCAPTCHA Console