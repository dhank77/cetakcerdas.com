# Setup reCAPTCHA v3 untuk Laravel Print

## Konfigurasi Environment

Tambahkan konfigurasi berikut ke file `.env` Anda:

```env
# reCAPTCHA v3 Configuration
RECAPTCHAV3_SITEKEY=your_site_key_here
RECAPTCHAV3_SECRET=your_secret_key_here
RECAPTCHAV3_LOCALE=id
```

## Cara Mendapatkan Site Key dan Secret Key

1. Kunjungi [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Klik "Create" untuk membuat site baru
3. Pilih reCAPTCHA v3
4. Masukkan domain website Anda (contoh: `cetakcerdas.com`)
5. Untuk development, tambahkan juga `localhost`
6. Setelah dibuat, copy Site Key dan Secret Key ke file `.env`

## Implementasi yang Sudah Ditambahkan

### Backend (Laravel)

1. **Package**: `josiasmontag/laravel-recaptchav3` sudah diinstall
2. **Validasi Login**: Ditambahkan di `app/Http/Requests/Auth/LoginRequest.php`
3. **Validasi Register**: Ditambahkan di `app/Http/Controllers/Auth/RegisteredUserController.php`
4. **Script reCAPTCHA**: Ditambahkan di `resources/views/app.blade.php`

### Frontend (React)

1. **Form Login**: Field reCAPTCHA tersembunyi ditambahkan di `resources/js/pages/auth/login.tsx`
2. **Form Register**: Field reCAPTCHA tersembunyi ditambahkan di `resources/js/pages/auth/register.tsx`
3. **Type Definitions**: Ditambahkan di `resources/js/types/recaptcha.d.ts`

## Cara Kerja

1. Script reCAPTCHA v3 dimuat di setiap halaman
2. Saat user submit form login/register, token reCAPTCHA otomatis dihasilkan
3. Token dikirim ke backend untuk divalidasi
4. Backend memverifikasi token dengan Google reCAPTCHA API
5. Jika score >= 0.5, form diproses. Jika tidak, ditolak.

## Testing

Untuk testing, Anda bisa mock reCAPTCHA facade:

```php
RecaptchaV3::shouldReceive('verify')
    ->once()
    ->andReturn(1.0);
```

## Troubleshooting

1. **reCAPTCHA tidak muncul**: Pastikan Site Key sudah benar di `.env`
2. **Validasi gagal**: Pastikan Secret Key sudah benar di `.env`
3. **Domain error**: Pastikan domain sudah didaftarkan di Google reCAPTCHA Console