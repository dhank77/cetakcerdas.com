import { BrowserWindow, shell } from 'electron';
import path from 'path';
import { CONFIG } from '../config.js';
import { createMenu } from './menu.js';

// ES6 module equivalent of __dirname
const __dirname = path.dirname(new URL(import.meta.url).pathname);

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
    icon: path.join(__dirname, '../../assets/icon.png'),
    show: false
  });

  // Load loading page
  loadingWindow.loadFile(path.join(__dirname, '../../frontend-build/loading.html'));

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
      preload: path.join(__dirname, '../preload.js')
    },
    icon: path.join(__dirname, '../../assets/icon.png'),
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
  
  // Add desktop app headers
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    { urls: ['*://cetakcerdas.com/*'] },
    (details, callback) => {
      details.requestHeaders['X-Desktop-App'] = 'true';
      callback({ requestHeaders: details.requestHeaders });
    }
  );
  
  // Redirect price calculation to local service
  mainWindow.webContents.session.webRequest.onBeforeRequest(
    { urls: ['*://cetakcerdas.com/calculate-price'] },
    (details, callback) => {
      callback({ redirectURL: `http://127.0.0.1:${CONFIG.LOCAL_PORT}/calculate-price` });
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
      preload: path.join(__dirname, '../preload.js')
    },
    title: 'Local File Browser - Cetak Cerdas',
    icon: path.join(__dirname, '../../assets/icon.png')
  });
  
  // Load the main application but with a special parameter for file browser mode
  fileBrowserWindow.loadURL(`${CONFIG.SERVER_URL}/protected-print?mode=file-browser`);
  
  fileBrowserWindow.on('closed', () => {
    fileBrowserWindow = null;
  });
  
  return fileBrowserWindow;
}