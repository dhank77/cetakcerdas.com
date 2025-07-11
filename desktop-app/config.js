// Desktop Application Configuration
export const SERVER_URL = process.env.SERVER_URL || 'https://cetakcerdas.com';
export const LOCAL_PORT = 3001;
export const PYTHON_PORT = 9006;
export const APP_NAME = 'Cetak Cerdas';
export const APP_VERSION = '1.0.0';
export const WINDOW = {
    WIDTH: 1200,
    HEIGHT: 800,
    MIN_WIDTH: 800,
    MIN_HEIGHT: 600
};
export const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
export const UPDATE_SERVER = process.env.UPDATE_SERVER || null;
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';