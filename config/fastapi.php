<?php

return [
    // URL untuk FastAPI online service
    'url' => env('FASTAPI_URL', 'http://localhost:9006'),
    
    // Mode operasi: 'online' atau 'local'
    // 'online' = menggunakan FastAPI web service
    // 'local' = menggunakan executable lokal
    'mode' => env('FASTAPI_MODE', 'local'),
    
    // Path ke executable (untuk mode local)
    'executable_path' => env('FASTAPI_EXECUTABLE_PATH', base_path('fastapi/pdf_analyzer/pdf_analyzer')),
    
    // Auto fallback ke mode lain jika gagal
    'auto_fallback' => env('FASTAPI_AUTO_FALLBACK', true),
];
