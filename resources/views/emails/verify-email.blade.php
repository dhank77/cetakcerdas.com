@component('mail::message')
# Verifikasi Email - {{ config('app.name') }}

Halo **{{ $user->name }}**!

Terima kasih telah bergabung dengan {{ config('app.name') }}, platform print online terpercaya yang siap membantu kebutuhan cetak dokumen Anda.

Untuk melengkapi proses pendaftaran dan mengakses semua fitur layanan kami, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini:

@component('mail::button', ['url' => $verificationUrl, 'color' => 'primary'])
Verifikasi Email Saya
@endcomponent

**Mengapa perlu verifikasi email?**
- Keamanan akun Anda terjamin
- Mendapatkan notifikasi status pesanan
- Akses ke riwayat print dan pengaturan
- Dukungan pelanggan yang lebih baik

Jika Anda tidak membuat akun di platform kami, abaikan email ini.

**Catatan:** Link verifikasi ini akan kedaluwarsa dalam **60 menit**.

Terima kasih,<br>
Tim {{ config('app.name') }}

---

<small>Jika tombol "Verifikasi Email Saya" tidak berfungsi, salin dan tempel URL berikut ke browser Anda:<br>
{{ $verificationUrl }}</small>
@endcomponent