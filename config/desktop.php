<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Desktop Application Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration settings specific to the desktop application version
    | of the Print Management System.
    |
    */

    // Desktop app version information
    'version' => [
        'current' => '1.0.0',
        'minimum_supported' => '1.0.0',
        'check_updates' => env('DESKTOP_CHECK_UPDATES', true),
    ],

    // Download URLs for different platforms
    'download_urls' => [
        'windows' => env('DESKTOP_DOWNLOAD_URL_WINDOWS', null),
        'mac' => env('DESKTOP_DOWNLOAD_URL_MAC', null),
        'linux' => env('DESKTOP_DOWNLOAD_URL_LINUX', null),
    ],

    // Update server configuration
    'update_server' => [
        'enabled' => env('DESKTOP_UPDATE_SERVER_ENABLED', false),
        'url' => env('DESKTOP_UPDATE_SERVER_URL', null),
        'check_interval' => env('DESKTOP_UPDATE_CHECK_INTERVAL', 24), // hours
    ],

    // Local Python service configuration
    'python_service' => [
        'port' => env('DESKTOP_PYTHON_PORT', 9006),
        'host' => env('DESKTOP_PYTHON_HOST', '127.0.0.1'),
        'timeout' => env('DESKTOP_PYTHON_TIMEOUT', 30), // seconds
        'health_check_interval' => env('DESKTOP_PYTHON_HEALTH_CHECK', 60), // seconds
    ],

    // Desktop app specific features
    'features' => [
        'local_pdf_processing' => env('DESKTOP_LOCAL_PDF_PROCESSING', true),
        'offline_mode' => env('DESKTOP_OFFLINE_MODE', false),
        'auto_update' => env('DESKTOP_AUTO_UPDATE', false),
        'error_reporting' => env('DESKTOP_ERROR_REPORTING', true),
        'analytics' => env('DESKTOP_ANALYTICS', false),
    ],

    // Performance settings
    'performance' => [
        'max_file_size' => env('DESKTOP_MAX_FILE_SIZE', 52428800), // 50MB in bytes
        'max_pages_per_document' => env('DESKTOP_MAX_PAGES', 1000),
        'concurrent_processing' => env('DESKTOP_CONCURRENT_PROCESSING', 2),
        'cache_enabled' => env('DESKTOP_CACHE_ENABLED', true),
    ],

    // Security settings
    'security' => [
        'allowed_origins' => [
            'http://localhost:3001',
            'app://*',
            'file://*',
        ],
        'csrf_exempt_routes' => [
            'desktop/*',
            'analyze-document-local',
        ],
        'rate_limiting' => [
            'enabled' => env('DESKTOP_RATE_LIMITING', true),
            'max_requests' => env('DESKTOP_MAX_REQUESTS', 100),
            'per_minutes' => env('DESKTOP_RATE_LIMIT_WINDOW', 60),
        ],
    ],

    // Logging configuration
    'logging' => [
        'enabled' => env('DESKTOP_LOGGING_ENABLED', true),
        'level' => env('DESKTOP_LOG_LEVEL', 'info'),
        'separate_log_file' => env('DESKTOP_SEPARATE_LOG', true),
        'log_file' => env('DESKTOP_LOG_FILE', 'desktop-app.log'),
    ],

    // User interface settings
    'ui' => [
        'default_theme' => env('DESKTOP_DEFAULT_THEME', 'system'),
        'default_zoom' => env('DESKTOP_DEFAULT_ZOOM', 1.0),
        'window_state' => env('DESKTOP_DEFAULT_WINDOW_STATE', 'maximized'),
        'remember_window_state' => env('DESKTOP_REMEMBER_WINDOW_STATE', true),
    ],

    // Notification settings
    'notifications' => [
        'enabled' => env('DESKTOP_NOTIFICATIONS_ENABLED', true),
        'show_processing_progress' => env('DESKTOP_SHOW_PROGRESS', true),
        'show_completion_notification' => env('DESKTOP_SHOW_COMPLETION', true),
        'show_error_notifications' => env('DESKTOP_SHOW_ERRORS', true),
    ],

    // Development and debugging
    'debug' => [
        'enabled' => env('DESKTOP_DEBUG', false),
        'show_dev_tools' => env('DESKTOP_SHOW_DEV_TOOLS', false),
        'verbose_logging' => env('DESKTOP_VERBOSE_LOGGING', false),
        'performance_monitoring' => env('DESKTOP_PERFORMANCE_MONITORING', false),
    ],

    // Backup and recovery
    'backup' => [
        'auto_backup_settings' => env('DESKTOP_AUTO_BACKUP_SETTINGS', true),
        'backup_interval' => env('DESKTOP_BACKUP_INTERVAL', 24), // hours
        'max_backup_files' => env('DESKTOP_MAX_BACKUP_FILES', 5),
    ],

    // Integration settings
    'integration' => [
        'server_health_check_interval' => env('DESKTOP_SERVER_HEALTH_CHECK', 300), // seconds
        'retry_failed_requests' => env('DESKTOP_RETRY_FAILED_REQUESTS', true),
        'max_retry_attempts' => env('DESKTOP_MAX_RETRY_ATTEMPTS', 3),
        'retry_delay' => env('DESKTOP_RETRY_DELAY', 5), // seconds
    ],
];