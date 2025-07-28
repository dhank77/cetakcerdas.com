import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // File operations
  selectFile: () => ipcRenderer.invoke('select-file'),
  
  // PDF Analysis
  analyzeDocument: (fileData) => ipcRenderer.invoke('analyze-document', fileData),
  
  // Print functionality
  printDocument: (url) => ipcRenderer.invoke('print-document', url),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (settings) => ipcRenderer.invoke('set-settings', settings),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // Development
  isDev: () => ipcRenderer.invoke('is-dev'),
  
  // Event listeners
  onWindowStateChange: (callback) => {
    ipcRenderer.on('window-state-changed', callback);
    return () => ipcRenderer.removeListener('window-state-changed', callback);
  }
});

// Expose a limited API for the renderer
contextBridge.exposeInMainWorld('desktopAPI', {
  platform: process.platform,
  isDesktop: true,
  version: process.env.npm_package_version || '1.0.0'
});