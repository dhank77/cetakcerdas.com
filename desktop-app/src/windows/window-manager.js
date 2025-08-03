import { BrowserWindow, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from '../config.js';
import { createMenu } from './menu.js';
import { proxyServerPort } from '../services/proxy-server.js';

// ES6 module equivalent of __dirname with Windows compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Normalize paths for cross-platform compatibility
function getAssetPath(relativePath) {
  return path.normalize(path.join(__dirname, relativePath));
}

function getFrontendPath(relativePath) {
  return path.normalize(path.join(__dirname, '../../frontend-build', relativePath));
}

// Global window references
export let mainWindow;
export let loadingWindow;
export let fileBrowserWindow;

// Create loading window
export function createLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: getAssetPath('../../assets/icon.png'),
    show: false
  });

  // Load loading page
  loadingWindow.loadFile(getFrontendPath('loading.html'));

  loadingWindow.once('ready-to-show', () => {
    loadingWindow.show();
  });

  loadingWindow.on('closed', () => {
    loadingWindow = null;
  });
}

// Create main application window
export function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: getAssetPath('../preload.js')
    },
    icon: getAssetPath('../../assets/icon.png'),
    show: false
  });

  // Load application URL
  const url = CONFIG.isDev ? 'http://localhost:8000/protected-print' : `${CONFIG.SERVER_URL}/protected-print`;
  mainWindow.loadURL(url);
  
  if (CONFIG.isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (loadingWindow) {
      loadingWindow.close();
    }
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url).catch(console.error);
    return { action: 'deny' };
  });

  createMenu();
  
  // Add desktop app headers with multiple identification methods
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    { urls: ['*://cetakcerdas.com/*', '*://localhost:*/*', '*://127.0.0.1:*/*'] },
    (details, callback) => {
      details.requestHeaders['X-Desktop-App'] = 'true';
      details.requestHeaders['X-Electron-App'] = 'true';
      details.requestHeaders['X-Local-App'] = 'true';
      details.requestHeaders['User-Agent'] = details.requestHeaders['User-Agent'] + ' CetakCerdas/1.0.0';
      callback({ requestHeaders: details.requestHeaders });
    }
  );
  
  // Redirect price calculation to local service
  mainWindow.webContents.session.webRequest.onBeforeRequest(
    { urls: ['*://cetakcerdas.com/calculate-price'] },
    (details, callback) => {
      const port = proxyServerPort || CONFIG.LOCAL_PORT;
      callback({ redirectURL: `http://127.0.0.1:${port}/calculate-price` });
    }
  );
}

// Update loading status
export function updateLoadingStatus(message) {
  if (loadingWindow && loadingWindow.webContents) {
    loadingWindow.webContents.executeJavaScript(`
      if (window.updateStatus) {
        window.updateStatus('${message}');
      }
    `);
  }
}

// Create file browser window
export function createFileBrowserWindow() {
  fileBrowserWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: getAssetPath('../preload.js')
    },
    title: 'Local File Browser - Cetak Cerdas',
    icon: getAssetPath('../../assets/icon.png')
  });
  
  // Load the main application but with a special parameter for file browser mode
  fileBrowserWindow.loadURL(`${CONFIG.SERVER_URL}/protected-print?mode=file-browser`);
  
  fileBrowserWindow.on('closed', () => {
    fileBrowserWindow = null;
  });
  
  return fileBrowserWindow;
}