<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class CleanupTempFiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cleanup:temp-files {--hours=24 : Hours after which files should be deleted}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up temporary uploaded files older than specified hours';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $hours = (int) $this->option('hours');
        $cutoffTime = Carbon::now()->subHours($hours);
        
        $this->info("Cleaning up files older than {$hours} hours (before {$cutoffTime->format('Y-m-d H:i:s')})...");
        
        $disk = Storage::disk('public');
        $tempPath = 'temp-uploads';
        
        if (!$disk->exists($tempPath)) {
            $this->info('Temp uploads directory does not exist.');
            return self::SUCCESS;
        }
        
        $files = $disk->files($tempPath);
        $deletedCount = 0;
        $totalSize = 0;
        
        foreach ($files as $file) {
            $lastModified = Carbon::createFromTimestamp($disk->lastModified($file));
            
            if ($lastModified->lt($cutoffTime)) {
                $fileSize = $disk->size($file);
                $totalSize += $fileSize;
                
                $disk->delete($file);
                $deletedCount++;
                
                $this->line("Deleted: {$file} (" . $this->formatBytes($fileSize) . ", modified: {$lastModified->format('Y-m-d H:i:s')})");
            }
        }
        
        if ($deletedCount > 0) {
            $this->info("Successfully deleted {$deletedCount} files, freed " . $this->formatBytes($totalSize) . " of storage.");
        } else {
            $this->info('No files found to delete.');
        }
        
        return self::SUCCESS;
    }
    
    /**
     * Format bytes to human readable format
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}