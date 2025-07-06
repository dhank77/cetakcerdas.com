# Temporary Files Cleanup System

Sistem ini mengelola pembersihan file temporary yang diupload untuk preview dokumen DOCX.

## Fitur

- **Automatic Cleanup**: File akan dihapus otomatis setelah 24 jam
- **Manual Cleanup**: Dapat dijalankan manual kapan saja
- **Configurable**: Dapat mengatur berapa jam file akan disimpan
- **Logging**: Mencatat aktivitas pembersihan

## Setup Otomatis (Recommended)

### 1. Laravel Scheduler

Sistem sudah dikonfigurasi untuk menjalankan cleanup setiap jam menggunakan Laravel Scheduler.

**Setup Cron Job:**
```bash
# Edit crontab
crontab -e

# Tambahkan baris ini:
* * * * * cd /path/to/your/laravel/project && php artisan schedule:run >> /dev/null 2>&1
```

### 2. Verifikasi Setup

```bash
# Test manual cleanup
php artisan cleanup:temp-files

# Test dengan custom hours
php artisan cleanup:temp-files --hours=12
```

## Setup Manual

### 1. Shell Script

```bash
# Jalankan script cleanup
./cleanup-temp-files.sh

# Dengan custom hours
./cleanup-temp-files.sh 12
```

### 2. Direct Cron Job

```bash
# Edit crontab
crontab -e

# Cleanup setiap jam
0 * * * * cd /path/to/your/laravel/project && php artisan cleanup:temp-files >> storage/logs/cleanup.log 2>&1

# Cleanup setiap 6 jam
0 */6 * * * cd /path/to/your/laravel/project && php artisan cleanup:temp-files >> storage/logs/cleanup.log 2>&1
```

## Commands Available

### Artisan Command

```bash
# Basic cleanup (24 hours default)
php artisan cleanup:temp-files

# Custom hours
php artisan cleanup:temp-files --hours=12
php artisan cleanup:temp-files --hours=48
```

### Shell Script

```bash
# Make executable (one time)
chmod +x cleanup-temp-files.sh

# Run cleanup
./cleanup-temp-files.sh

# With custom hours
./cleanup-temp-files.sh 12
```

## File Structure

```
storage/app/public/temp-uploads/
├── 1704067200_abc123def4.docx
├── 1704067201_xyz789ghi0.pdf
└── ...
```

**File Naming Convention:**
- `{timestamp}_{random_string}.{extension}`
- Timestamp digunakan untuk menentukan umur file

## Monitoring

### Log Files

```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Cleanup logs (jika menggunakan shell script)
tail -f storage/logs/cleanup.log
```

### Manual Check

```bash
# Lihat file temporary
ls -la storage/app/public/temp-uploads/

# Lihat ukuran directory
du -sh storage/app/public/temp-uploads/

# Count files
find storage/app/public/temp-uploads/ -type f | wc -l
```

## Troubleshooting

### Permission Issues

```bash
# Fix storage permissions
chmod -R 775 storage/
chown -R www-data:www-data storage/

# Fix script permissions
chmod +x cleanup-temp-files.sh
```

### Directory Not Found

```bash
# Create temp-uploads directory
mkdir -p storage/app/public/temp-uploads
chmod 775 storage/app/public/temp-uploads
```

### Cron Not Working

```bash
# Check cron service
sudo service cron status

# Check cron logs
sudo tail -f /var/log/cron

# Test cron manually
/bin/bash -c "cd /path/to/laravel && php artisan cleanup:temp-files"
```

## Configuration

### Environment Variables

Tambahkan ke `.env` jika diperlukan:

```env
# Custom cleanup settings
TEMP_FILE_LIFETIME_HOURS=24
CLEANUP_LOG_ENABLED=true
```

### Custom Schedule

Edit `app/Console/Kernel.php` untuk mengubah jadwal:

```php
protected function schedule(Schedule $schedule): void
{
    // Setiap 30 menit
    $schedule->command('cleanup:temp-files')
             ->everyThirtyMinutes();
    
    // Setiap hari jam 2 pagi
    $schedule->command('cleanup:temp-files')
             ->dailyAt('02:00');
    
    // Custom hours
    $schedule->command('cleanup:temp-files --hours=12')
             ->hourly();
}
```

## Security Notes

1. **File Access**: File disimpan di `storage/app/public` yang dapat diakses publik
2. **Random Names**: Nama file menggunakan timestamp + random string untuk keamanan
3. **Auto Cleanup**: File otomatis terhapus untuk mencegah penumpukan
4. **HTTPS Required**: Office Web Apps memerlukan HTTPS untuk preview

## Performance Tips

1. **Monitor Disk Space**: Pastikan ada cukup ruang untuk file temporary
2. **Adjust Cleanup Frequency**: Sesuaikan frekuensi cleanup berdasarkan traffic
3. **File Size Limits**: Pertimbangkan batasan ukuran file upload
4. **CDN**: Gunakan CDN untuk file static jika diperlukan