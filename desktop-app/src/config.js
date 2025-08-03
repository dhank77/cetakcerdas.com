// Application configuration
export const CONFIG = {
  SERVER_URL: 'https://cetakcerdas.com',
  PYTHON_PORT: 9006,
  LOCAL_PORT: 3001,
  isDev: process.argv.includes('--dev')
};

// Network configuration
export const NETWORK_TIMEOUT = 30000;
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000;

// Disable SSL certificate validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';