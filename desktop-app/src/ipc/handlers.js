/* eslint-disable @typescript-eslint/no-require-imports */
import { ipcMain, BrowserWindow, dialog, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { mainWindow, createFileBrowserWindow } from '../windows/window-manager.js';
import { fetchWithRetry } from '../utils/network.js';
import { pythonServicePort } from '../services/python-service.js';
import {
  saveAnalysisResult,
  getAnalysisHistory,
  getPrintSettings,
  savePrintSettings,
  clearAnalysisCache
} from '../storage/store.js';

// Setup main IPC handlers
export function setupIpcHandlers() {
  // Handle print document request
  ipcMain.handle('print-document', async (event, url) => {
    console.log('🖨️ Print document request received with URL:', url);
    try {
      if (!mainWindow) {
        console.error('❌ Main window not available');
        throw new Error('Main window not available');
      }
      
      // Handle file:// URLs by serving them through a local server
      let actualUrl = url;
      if (url.startsWith('file://')) {
        const filePath = url.replace('file://', '');
        console.log('📁 Local file detected, serving through HTTP:', filePath);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
          throw new Error('File not found: ' + filePath);
        }
        
        // For local files, we'll serve them through the proxy server
        const fileName = path.basename(filePath);
        
        // Copy file to a temporary location accessible by the proxy server
        const tempDir = path.join(process.cwd(), 'temp-print');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const tempFilePath = path.join(tempDir, fileName);
        fs.copyFileSync(filePath, tempFilePath);
        
        // Use proxy server URL
        actualUrl = `http://localhost:3001/temp-print/${fileName}`;
        console.log('🌐 Serving file through proxy server:', actualUrl);
      }
      
      console.log('✅ Creating print window...');
      // Create a new window for printing (show as new tab)
      const printWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: true, // Show the window like a new tab
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        },
        title: 'Print Preview'
      });
      
      console.log('📄 Loading document URL:', actualUrl);
      // Load the document URL
      await printWindow.loadURL(actualUrl);
      
      console.log('⏳ Waiting for page to load...');
      // Wait for the page to load completely
      await new Promise((resolve) => {
        printWindow.webContents.once('did-finish-load', () => {
          console.log('✅ Page loaded successfully');
          resolve();
        });
      });
      
      console.log('🖨️ Showing print dialog in 1 second...');
      // Show print dialog automatically after page loads
      setTimeout(() => {
        console.log('🖨️ Opening print dialog now');
        printWindow.webContents.print({
          silent: false,
          printBackground: true,
          deviceName: '',
          color: true,
          margins: {
            marginType: 'printableArea'
          },
          landscape: false,
          scaleFactor: 100
        }, (success, failureReason) => {
          if (!success) {
            console.error('❌ Print failed:', failureReason);
          } else {
            console.log('✅ Print dialog opened successfully');
          }
          // Don't auto-close the window, let user close it manually
        });
      }, 1000); // Wait 1 second for page to fully render
      
      console.log('✅ Print document handler completed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Print error:', error);
      return { success: false, error: error.message };
    }
  });

  // Get print settings
  ipcMain.handle('get-print-settings', async () => {
    return getPrintSettings();
  });

  // Save print settings
  ipcMain.handle('save-print-settings', async (event, settings) => {
    return savePrintSettings(settings);
  });

  // Clear analysis cache
  ipcMain.handle('clear-analysis-cache', async () => {
    return clearAnalysisCache();
  });

  // Get file info
  ipcMain.handle('get-file-info', async (event, filePath) => {
    try {
      const stats = fs.statSync(filePath);
      return {
        success: true,
        size: stats.size,
        lastModified: stats.mtime.getTime(),
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return { success: false, error: error.message };
    }
  });

  // Read file content
  ipcMain.handle('read-file-content', async (event, filePath) => {
    try {
      // Read file content
      const content = fs.readFileSync(filePath);
      return { success: true, content: content.toString('base64') };
    } catch (error) {
      console.error('Error reading file content:', error);
      return { success: false, error: error.message };
    }
  });

  // Handle order processing for desktop app
  ipcMain.handle('process-order', async (event, orderData) => {
    console.log('📦 Processing order in desktop app:', orderData);
    try {
      // For desktop app, we'll save the order locally and show success
      // In a real implementation, you might want to sync with server when online
      
      const orderRecord = {
        id: Date.now().toString(),
        items: orderData.items,
        timestamp: new Date().toISOString(),
        status: 'completed',
        totalAmount: orderData.totalAmount || 0
      };
      
      // Save order to local storage (you can implement this in store.js)
      console.log('💾 Order saved locally:', orderRecord);
      
      return {
        success: true,
        message: 'Pesanan berhasil diproses di aplikasi desktop',
        orderId: orderRecord.id
      };
    } catch (error) {
      console.error('❌ Order processing failed:', error);
      return {
        success: false,
        message: 'Gagal memproses pesanan: ' + error.message
      };
    }
  });

  // Enhanced print operations
  ipcMain.handle('print-local-file-enhanced', async (event, options) => {
    try {
      const { filePath, printSettings, officePreference } = options;
      
      console.log('🖨️ Enhanced print request:', { filePath, printSettings, officePreference });
      
      // Check file extension
      const fileExtension = filePath.toLowerCase().split('.').pop();
      const isDocxFile = fileExtension === 'docx';
      
      if (isDocxFile) {
        const officeApp = officePreference?.type || 'auto';
        console.log('📄 DOCX file detected, using office preference:', officeApp);
        
        // For DOCX files, use the selected office application
        try {
          const actualFilePath = filePath.startsWith('file://') ? filePath.replace('file://', '') : filePath;
          
          // Check if file exists
          if (!fs.existsSync(actualFilePath)) {
            throw new Error('DOCX file not found');
          }
          
          // Handle different office applications
          if (officeApp === 'libreoffice') {
            // Try to open with LibreOffice
            const { spawn } = await import('child_process');
            const libreOfficeProcess = spawn('libreoffice', ['--writer', actualFilePath], {
              detached: true,
              stdio: 'ignore'
            });
            libreOfficeProcess.unref();
            console.log('✅ Opened with LibreOffice');
          } else {
            // For auto, microsoft, wps, or other options, use system default
            await shell.openPath(actualFilePath);
            console.log('✅ Opened with system default application');
          }
          
          // Return success - user will need to print from the opened application
          return {
            success: true,
            message: 'DOCX file opened with system default application. Please print from the opened application.'
          };
        } catch (error) {
          console.error('Failed to open DOCX with system app:', error);
          return {
            success: false,
            failureReason: 'Gagal membuka file DOCX. Pastikan Microsoft Word atau aplikasi yang mendukung DOCX terinstall.'
          };
        }
      }
      
      // For PDF files and other supported formats
      const printWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });
      
      // Load the file
      if (filePath.startsWith('file://')) {
        await printWindow.loadURL(filePath);
      } else if (filePath.startsWith('http')) {
        await printWindow.loadURL(filePath);
      } else {
        await printWindow.loadFile(filePath);
      }
      
      // Wait for content to load
      await new Promise((resolve) => {
        printWindow.webContents.once('did-finish-load', resolve);
      });
      
      const printOptions = {
        silent: false,
        printBackground: true,
        color: printSettings.quality !== 'draft',
        margins: { marginType: 'printableArea' },
        landscape: printSettings.orientation === 'landscape',
        scaleFactor: printSettings.quality === 'high' ? 100 : 85,
        copies: printSettings.copies || 1
      };
      
      return new Promise((resolve) => {
        printWindow.webContents.print(printOptions, (success, failureReason) => {
          printWindow.close();
          resolve({ success, failureReason });
        });
      });
    } catch (error) {
      console.error('Enhanced print error:', error);
      return { success: false, failureReason: error.message };
    }
  });
}

// Setup local file handlers
export function setupLocalFileHandlers() {
  // File browser handlers
  ipcMain.handle('browse-local-files', async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Documents', extensions: ['pdf', 'docx'] },
          { name: 'PDF Files', extensions: ['pdf'] },
          { name: 'Word Documents', extensions: ['docx'] }
        ]
      });
      return result;
    } catch (error) {
      console.error('Error browsing files:', error);
      return { canceled: true, filePaths: [] };
    }
  });

  ipcMain.handle('open-local-file-browser', async () => {
    try {
      // Create new window for local file browser
      createFileBrowserWindow();
      return { success: true };
    } catch (error) {
      console.error('Error opening file browser:', error);
      return { success: false, error: error.message };
    }
  });

  // Analysis cache handlers
  ipcMain.handle('save-analysis-result', async (event, fileData) => {
    return saveAnalysisResult(fileData);
  });

  ipcMain.handle('get-analysis-history', async () => {
    return getAnalysisHistory();
  });

  // Local file analysis handler
  ipcMain.handle('analyze-local-file', async (event, fileData) => {
    try {
      const { filePath, fileName } = fileData;
      
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }
      
      if (!pythonServicePort) {
        throw new Error('Python service is not ready');
      }
      
      // Read file and create form data for analysis
      const fileBuffer = fs.readFileSync(filePath);
      const form = new FormData();
      form.append('file', fileBuffer, {
        filename: fileName,
        contentType: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      const response = await fetchWithRetry(`http://127.0.0.1:${pythonServicePort}/analyze-document?color_threshold=20&photo_threshold=30`, {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Analysis service error: ${response.status} ${response.statusText}`);
      }
      
      const analysisResult = await response.json();
      
      // Calculate prices with default settings
      const priceSettingColor = 1000;
      const priceSettingBw = 500;
      const priceSettingPhoto = 2000;
      
      const priceColor = (analysisResult.color_pages || 0) * priceSettingColor;
      const priceBw = (analysisResult.bw_pages || 0) * priceSettingBw;
      const pricePhoto = (analysisResult.photo_pages || 0) * priceSettingPhoto;
      const totalPrice = priceColor + priceBw + pricePhoto;
      
      const result = {
        ...analysisResult,
        price_color: priceColor,
        price_bw: priceBw,
        price_photo: pricePhoto,
        total_price: totalPrice,
        file_name: fileName,
        file_url: `file://${filePath}`,
        analysis_mode: 'local_desktop'
      };
      
      return { success: true, result };
    } catch (error) {
      console.error('Error analyzing local file:', error);
      return { success: false, error: error.message };
    }
  });

  // Uploaded file analysis handler (for files uploaded through web interface)
  ipcMain.handle('analyze-uploaded-file', async (event, fileData) => {
    try {
      const { fileName, fileData: uint8Array } = fileData;
      
      if (!pythonServicePort) {
        throw new Error('Python service is not ready');
      }
      
      // Create a temporary file from the uploaded data
      const path = require('path');
      const os = require('os');
      const tempDir = os.tmpdir();
      const tempFileName = `temp_${Date.now()}_${fileName}`;
      const tempFilePath = path.join(tempDir, tempFileName);
      
      // Write the file data to temporary file
      const buffer = Buffer.from(uint8Array);
      fs.writeFileSync(tempFilePath, buffer);
      
      // Create form data for analysis
      const form = new FormData();
      form.append('file', buffer, {
        filename: fileName,
        contentType: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      const response = await fetchWithRetry(`http://127.0.0.1:${pythonServicePort}/analyze-document?color_threshold=20&photo_threshold=30`, {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
      });
      
      if (!response.ok) {
        // Clean up temp file on error
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        try { fs.unlinkSync(tempFilePath); } catch (e) { /* empty */ }
        throw new Error(`Analysis service error: ${response.status} ${response.statusText}`);
      }
      
      const analysisResult = await response.json();
      
      // Calculate prices with default settings
      const priceSettingColor = 1000;
      const priceSettingBw = 500;
      const priceSettingPhoto = 2000;
      
      const priceColor = (analysisResult.color_pages || 0) * priceSettingColor;
      const priceBw = (analysisResult.bw_pages || 0) * priceSettingBw;
      const pricePhoto = (analysisResult.photo_pages || 0) * priceSettingPhoto;
      const totalPrice = priceColor + priceBw + pricePhoto;
      
      const result = {
        ...analysisResult,
        price_color: priceColor,
        price_bw: priceBw,
        price_photo: pricePhoto,
        total_price: totalPrice,
        file_name: fileName,
        analysis_mode: 'local_desktop'
      };
      
      return { success: true, data: result, tempFilePath };
    } catch (error) {
      console.error('Error analyzing uploaded file:', error);
      return { success: false, error: error.message };
    }
  });
}

// Setup office application preference handlers
export function setupOfficePreferenceHandlers() {
  // Handle saving office application preference
  ipcMain.handle('save-office-preference', async (event, preference) => {
    try {
      const { saveOfficePreference } = await import('../storage/store.js');
      await saveOfficePreference(preference);
      console.log('✅ Office preference saved:', preference);
      return { success: true };
    } catch (error) {
      console.error('❌ Error saving office preference:', error);
      return { success: false, error: error.message };
    }
  });

  // Handle getting office application preference
  ipcMain.handle('get-office-preference', async () => {
    try {
      const { getOfficePreference } = await import('../storage/store.js');
      const preference = await getOfficePreference();
      console.log('✅ Office preference retrieved:', preference);
      return { success: true, preference };
    } catch (error) {
      console.error('❌ Error getting office preference:', error);
      return { success: false, error: error.message, preference: { type: 'auto' } };
    }
  });
}