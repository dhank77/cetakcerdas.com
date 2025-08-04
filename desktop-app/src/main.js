import { app, BrowserWindow } from 'electron';
import { createLoadingWindow, createWindow } from './windows/window-manager.js';
import { startPythonService, pythonProcess } from './services/python-service.js';
import { localServer } from './services/proxy-server.js';
import { setupIpcHandlers, setupLocalFileHandlers, setupOfficePreferenceHandlers } from './ipc/handlers.js';

// App event handlers
app.whenReady().then(async () => {
  try {
    // Setup IPC handlers
    setupIpcHandlers();
    setupLocalFileHandlers();
    setupOfficePreferenceHandlers();
    
    // Create loading window first
    createLoadingWindow();
    
    try {
      await startPythonService();
      console.log('Python service ready');
    } catch (error) {
      console.error('Failed to start Python service:', error);
    }
    
    // Wait a moment for services to fully initialize, then create main window
    setTimeout(() => {
      createWindow();
    }, 1000);
    
  } catch (error) {
    console.error('Failed to start services:', error);
    setTimeout(() => {
      createWindow();
    }, 1000);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
  if (localServer) {
    localServer.close();
  }
});

// Handle app crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});