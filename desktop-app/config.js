// Desktop Application Configuration
module.exports = {
  // Main Laravel server URL - CHANGE THIS TO YOUR ACTUAL SERVER
  SERVER_URL: process.env.SERVER_URL || 'https://your-laravel-server.com',
  
  // Local development settings
  LOCAL_PORT: 3001,
  PYTHON_PORT: 9006,
  
  // Application settings
  APP_NAME: 'Print Management System',
  APP_VERSION: '1.0.0',
  
  // Window settings
  WINDOW: {
    WIDTH: 1200,
    HEIGHT: 800,
    MIN_WIDTH: 800,
    MIN_HEIGHT: 600
  },
  
  // Development mode
  isDev: process.argv.includes('--dev') || process.env.NODE_ENV === 'development',
  
  // Auto-updater settings (for future use)
  UPDATE_SERVER: process.env.UPDATE_SERVER || null,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};