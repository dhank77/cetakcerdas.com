import { app, BrowserWindow, Menu, dialog, shell, ipcMain } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import fs from 'fs';
import fetch from 'node-fetch';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import FormData from 'form-data';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Store from 'electron-store';
import crypto from 'crypto';
import net from 'net';

// ES6 module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  SERVER_URL: process.env.SERVER_URL || 'https://cetakcerdas.com',
  PYTHON_PORT: 9006, // Base port for Python service
  LOCAL_PORT: 3001, // Port for local proxy server
  isDev: process.argv.includes('--dev')
};

// Disable SSL certificate validation for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let mainWindow;
let loadingWindow;
let pythonProcess;
let localServer;
let laravelProcess;
let fileBrowserWindow;

// Initialize local storage for analysis cache
const analysisStore = new Store({
  name: 'analysis-cache',
  defaults: {
    analyzedFiles: [],
    printSettings: {
      paperSize: 'A4',
      orientation: 'portrait',
      quality: 'normal',
      copies: 1,
      duplex: false
    }
  }
});

// Create loading window
function createLoadingWindow() {
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
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false
  });

  // Load loading page
  loadingWindow.loadFile(path.join(__dirname, '../frontend-build/loading.html'));

  loadingWindow.once('ready-to-show', () => {
    loadingWindow.show();
  });

  loadingWindow.on('closed', () => {
    loadingWindow = null;
  });
}

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Load the application with protected-print as default for desktop app
   if (CONFIG.isDev) {
     // Development mode - connect to Laravel dev server
     mainWindow.loadURL('http://localhost:8000/protected-print');
     mainWindow.webContents.openDevTools();
   } else {
     // Production mode - connect directly to server
     mainWindow.loadURL(`${CONFIG.SERVER_URL}/protected-print`);
   }

  // Show window when ready and hide loading window
  mainWindow.once('ready-to-show', () => {
    if (loadingWindow) {
      loadingWindow.close();
    }
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Add error handling for shell.openExternal
    shell.openExternal(url).catch((error) => {
      console.log('Could not open external URL:', url, error.message);
      // Silently fail - don't crash the app
    });
    return { action: 'deny' };
  });

  // Create application menu
  createMenu();
  
  // Add X-Desktop-App header to all requests to identify desktop app
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    { urls: ['*://cetakcerdas.com/*', '*://www.cetakcerdas.com/*'] },
    (details, callback) => {
      details.requestHeaders['X-Desktop-App'] = 'true';
      details.requestHeaders['User-Agent'] = 'Electron';
      callback({ requestHeaders: details.requestHeaders });
    }
  );
  
  // Intercept requests to handle local PDF analysis with price calculation
  mainWindow.webContents.session.webRequest.onBeforeRequest(
    { urls: ['*://cetakcerdas.com/calculate-price', '*://www.cetakcerdas.com/calculate-price'] },
    (details, callback) => {
      // Redirect to local proxy server that handles price calculation
      console.log('Intercepting calculate-price request for local analysis with price calculation');
      callback({ redirectURL: `http://127.0.0.1:${CONFIG.LOCAL_PORT}/calculate-price` });
    }
  );
}

// Update loading status
function updateLoadingStatus(message) {
  if (loadingWindow && loadingWindow.webContents) {
    loadingWindow.webContents.executeJavaScript(`
      if (window.updateStatus) {
        window.updateStatus('${message}');
      }
    `);
  }
}

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    
    tester.listen(port, '127.0.0.1');
    tester.once('error', () => {
      resolve(false);
    });
    tester.once('listening', () => {
      tester.close();
      resolve(true);
    });
  });
}

// Function to find an available port starting from basePort
async function findAvailablePort(basePort, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = basePort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`Could not find available port after ${maxAttempts} attempts`);
}

// Global variable to store the actual port being used
let pythonServicePort = CONFIG.PYTHON_PORT;

// Start Python service in server mode
async function startPythonService() {
  return new Promise((resolve, reject) => {
    updateLoadingStatus('Initializing PDF analyzer...');
    
    const pythonExePath = getPythonExecutablePath();
    
    console.log('Platform:', process.platform);
    console.log('Python executable path:', pythonExePath);
    
    if (!fs.existsSync(pythonExePath)) {
      console.error('Python executable not found:', pythonExePath);
      console.error('Current working directory:', process.cwd());
      console.error('__dirname:', __dirname);
      console.error('process.resourcesPath:', process.resourcesPath);
      updateLoadingStatus('PDF analyzer not found, using online service...');
      reject(new Error('Python service executable not found'));
      return;
    }
    
    // Check if file is executable on Windows
    if (process.platform === 'win32') {
      try {
        fs.accessSync(pythonExePath, fs.constants.F_OK | fs.constants.R_OK);
        console.log('Python executable is accessible on Windows');
      } catch (accessError) {
        console.error('Python executable access error on Windows:', accessError);
        updateLoadingStatus('PDF analyzer access denied, using online service...');
        reject(new Error('Python service executable access denied'));
        return;
      }
    }

    console.log('Starting Python service in server mode:', pythonExePath);
    updateLoadingStatus('Finding available port for PDF analyzer service...');
    
    // Find an available port for the Python service
    findAvailablePort(CONFIG.PYTHON_PORT)
      .then((availablePort) => {
        pythonServicePort = availablePort;
        updateLoadingStatus(`Starting PDF analyzer service on port ${pythonServicePort}...`);
        
        // Platform-specific environment variables
        const pythonEnv = {
          ...process.env,
          PYTHONUNBUFFERED: '1',
          PYTHONDONTWRITEBYTECODE: '1'
        };
        
        // Add macOS-specific environment variable only on macOS
        if (process.platform === 'darwin') {
          pythonEnv.OBJC_DISABLE_INITIALIZE_FORK_SAFETY = 'YES';
        }
        
        pythonProcess = spawn(pythonExePath, ['--mode', 'server', '--host', '127.0.0.1', '--port', pythonServicePort.toString()], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: pythonEnv
        });

        let serverReady = false;
        
        pythonProcess.stdout.on('data', (data) => {
          const output = data.toString();
          console.log('Python server:', output);
          if (output.includes('Uvicorn running on') || output.includes('Server started') || output.includes('Application startup complete')) {
            serverReady = true;
            updateLoadingStatus('PDF analyzer ready!');
          }
        });

        pythonProcess.stderr.on('data', (data) => {
          const output = data.toString();
          console.log('Python server info:', output);
          if (output.includes('Uvicorn running on') || output.includes('Server started') || output.includes('Application startup complete')) {
            serverReady = true;
            updateLoadingStatus('PDF analyzer ready!');
          }
        });

        pythonProcess.on('close', (code) => {
          console.log(`Python server exited with code ${code}`);
          pythonProcess = null;
        });

        pythonProcess.on('error', (error) => {
          console.error('Failed to start Python server:', error);
          console.error('Error code:', error.code);
          console.error('Error errno:', error.errno);
          console.error('Error syscall:', error.syscall);
          console.error('Error path:', error.path);
          
          // Windows-specific error handling
          if (process.platform === 'win32') {
            if (error.code === 'ENOENT') {
              console.error('Windows: Python executable not found or not in PATH');
            } else if (error.code === 'EACCES') {
              console.error('Windows: Permission denied - check antivirus or file permissions');
            } else if (error.code === 'EPERM') {
              console.error('Windows: Operation not permitted - check UAC or antivirus');
            }
          }
          
          updateLoadingStatus('PDF analyzer failed, using online service...');
          reject(error);
          return;
        });

        // Wait for server to be ready, then start proxy
        const checkReady = setInterval(() => {
          if (serverReady) {
            clearInterval(checkReady);
            updateLoadingStatus('Starting local services...');
            startProxyServer().then(() => {
              updateLoadingStatus('Services ready! Loading application...');
              resolve();
            }).catch(reject);
          }
        }, 50);

        // Platform-specific timeout - Windows may need more time
        const timeout = process.platform === 'win32' ? 30000 : 20000;
        
        setTimeout(() => {
          if (!serverReady) {
            clearInterval(checkReady);
            // Even if we didn't detect ready state, try to start proxy anyway
            console.log(`Timeout reached after ${timeout}ms, attempting to start proxy anyway...`);
            updateLoadingStatus('Timeout reached, starting anyway...');
            startProxyServer().then(() => {
              resolve();
            }).catch(reject);
          }
        }, timeout);
      })
      .catch((error) => {
        console.error('Failed to find available port:', error);
        updateLoadingStatus('Failed to find available port, using online service...');
        reject(error);
      });
  });
}

// Start proxy server that forwards requests to Python server
function startProxyServer() {
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Health check endpoint
    app.get('/', (req, res) => {
      res.json({ status: 'online', mode: 'server_proxy' });
    });

    // PDF analysis endpoint - proxy to Python server
    app.post('/analyze-document', multer().single('file'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const colorThreshold = parseFloat(req.query.color_threshold) || 10.0;
        const photoThreshold = parseFloat(req.query.photo_threshold) || 30.0;

        // Forward request to Python server
        const form = new FormData();
        form.append('file', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype
        });

        const response = await fetch(`http://127.0.0.1:${pythonServicePort}/analyze-document?color_threshold=${colorThreshold}&photo_threshold=${photoThreshold}`, {
          method: 'POST',
          body: form,
          headers: form.getHeaders()
        });

        if (!response.ok) {
          throw new Error(`Python server error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        res.json(result);

      } catch (error) {
        console.error('PDF analysis error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Calculate price endpoint - includes analysis and price calculation
    app.post('/calculate-price', multer().single('file'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get slug from form data (same as Laravel frontend)
        const slug = req.body.slug || 'testing';
        
        // Default price settings (same as Laravel controller)
        let priceSettingPhoto = 2000;
        let priceSettingColor = 1000;
        let priceSettingBw = 500;
        let colorThreshold = 20;
        let photoThreshold = 30;

        // Try to get user settings from Laravel API if slug is provided
        if (slug && slug !== 'testing') {
          try {
            const settingsResponse = await fetch(`${CONFIG.SERVER_URL}/api/user-settings/${slug}`);
            if (settingsResponse.ok) {
              const settingsData = await settingsResponse.json();
              if (settingsData.success && settingsData.data) {
                const settings = settingsData.data;
                priceSettingColor = settings.color_price || priceSettingColor;
                priceSettingPhoto = settings.photo_price || settings.color_price || priceSettingPhoto;
                priceSettingBw = settings.bw_price || priceSettingBw;
                colorThreshold = settings.threshold_color || colorThreshold;
                photoThreshold = settings.threshold_photo || photoThreshold;
              }
            }
          } catch (settingsError) {
            console.log('Could not fetch user settings, using defaults:', settingsError.message);
          }
        }

        // Parse query parameters for custom settings (override user settings if provided)
        if (req.query.price_setting_photo) priceSettingPhoto = parseInt(req.query.price_setting_photo);
        if (req.query.price_setting_color) priceSettingColor = parseInt(req.query.price_setting_color);
        if (req.query.price_setting_bw) priceSettingBw = parseInt(req.query.price_setting_bw);
        if (req.query.threshold_color) colorThreshold = parseFloat(req.query.threshold_color);
        if (req.query.threshold_photo) photoThreshold = parseFloat(req.query.threshold_photo);

        // Forward request to Python server for analysis
        const form = new FormData();
        form.append('file', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype
        });

        const response = await fetch(`http://127.0.0.1:${pythonServicePort}/analyze-document?color_threshold=${colorThreshold}&photo_threshold=${photoThreshold}`, {
          method: 'POST',
          body: form,
          headers: form.getHeaders()
        });

        if (!response.ok) {
          throw new Error(`Python server error: ${response.status} ${response.statusText}`);
        }

        const analysisResult = await response.json();

        // Calculate prices based on analysis result
        const priceColor = (analysisResult.color_pages || 0) * priceSettingColor;
        const priceBw = (analysisResult.bw_pages || 0) * priceSettingBw;
        const pricePhoto = (analysisResult.photo_pages || 0) * priceSettingPhoto;
        const totalPrice = priceColor + priceBw + pricePhoto;

        // Return response in same format as Laravel controller
        res.json({
          price_color: priceColor,
          price_bw: priceBw,
          price_photo: pricePhoto,
          total_price: totalPrice,
          file_url: null, // No file storage in desktop app
          file_name: req.file.originalname,
          file_type: req.file.mimetype,
          analysis_mode: 'local_desktop',
          service_available: true,
          pengaturan: {
            threshold_warna: colorThreshold.toString(),
            threshold_foto: photoThreshold.toString(),
            price_setting_color: priceSettingColor,
            price_setting_bw: priceSettingBw,
            price_setting_photo: priceSettingPhoto,
          },
          ...analysisResult,
        });

      } catch (error) {
        console.error('Calculate price error:', error);
        
        // Fallback result (same as Laravel controller)
        const fallbackResult = {
          price_color: 0,
          price_bw: 0,
          price_photo: 0,
          total_price: 0,
          file_url: null,
          file_name: req.file ? req.file.originalname : 'unknown',
          file_type: req.file ? req.file.mimetype : 'unknown',
          analysis_mode: 'local_desktop_fallback',
          service_available: false,
          pengaturan: {
            threshold_warna: '20',
            threshold_foto: '30',
            price_setting_color: 1000,
            price_setting_bw: 500,
            price_setting_photo: 2000,
          },
          color_pages: 0,
          bw_pages: 0,
          photo_pages: 0,
          total_pages: 0,
          page_details: [],
          fallback: true,
          error: error.message
        };
        
        res.status(500).json(fallbackResult);
      }
    });

    // Proxy all other requests (web pages) to the main server
    app.use('*', async (req, res) => {
      try {
        const targetUrl = `${CONFIG.SERVER_URL}${req.originalUrl}`;
        console.log(`Proxying web request: ${req.originalUrl} -> ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
          method: req.method,
          headers: {
            ...req.headers,
            'host': undefined, // Remove host header to avoid conflicts
            'x-forwarded-for': req.ip,
            'x-forwarded-proto': 'http',
            'x-desktop-app': 'true', // Mark as desktop app request
            'user-agent': req.headers['user-agent'] || 'CetakCerdas-Desktop-App'
          },
          body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
        });
        
        // Copy response headers
        response.headers.forEach((value, key) => {
          if (key.toLowerCase() !== 'content-encoding') {
            res.setHeader(key, value);
          }
        });
        
        res.status(response.status);
        
        // Get response text and inject desktop app detection script
        const responseText = await response.text();
        
        // If it's an HTML response, inject desktop app detection
        if (response.headers.get('content-type')?.includes('text/html')) {
          const injectedHtml = responseText.replace(
            '</head>',
            `<script>
              // Desktop app detection for preload script
              window.isDesktopApp = true;
              console.log('Desktop app detection injected');
            </script>
            </head>`
          );
          res.send(injectedHtml);
        } else {
          res.send(responseText);
        }
        
      } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy server error', details: error.message });
      }
    });

    // Start proxy server
    localServer = app.listen(CONFIG.LOCAL_PORT, '127.0.0.1', () => {
      console.log(`Local proxy server running on port ${CONFIG.LOCAL_PORT}, forwarding to Python server on port ${pythonServicePort}`);
      resolve();
    });

    localServer.on('error', (error) => {
      console.error('Local proxy server error:', error);
      console.error('Error code:', error.code);
      console.error('Error port:', error.port);
      console.error('Error address:', error.address);
      
      // Windows-specific port binding issues
      if (process.platform === 'win32') {
        if (error.code === 'EADDRINUSE') {
          console.error(`Windows: Port ${CONFIG.LOCAL_PORT} is already in use`);
        } else if (error.code === 'EACCES') {
          console.error(`Windows: Permission denied for port ${CONFIG.LOCAL_PORT} - may need admin rights`);
        } else if (error.code === 'EADDRNOTAVAIL') {
          console.error('Windows: Address not available - check network configuration');
        }
      }
      
      reject(error);
    });
  });
}

// Start fallback proxy that forwards all requests to online service
function startFallbackProxy() {
  return new Promise((resolve, reject) => {
    updateLoadingStatus('Setting up online service connection...');
    
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Health check endpoint
    app.get('/', (req, res) => {
      res.json({ status: 'online', mode: 'fallback_proxy' });
    });

    // PDF analysis endpoint - forward to online service
    app.post('/analyze-document', multer().single('file'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const colorThreshold = parseFloat(req.query.color_threshold) || 10.0;
        const photoThreshold = parseFloat(req.query.photo_threshold) || 30.0;

        // Forward request to online FastAPI service
        const form = new FormData();
        form.append('file', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype
        });

        const response = await fetch(`${CONFIG.SERVER_URL}/api/analyze-document?color_threshold=${colorThreshold}&photo_threshold=${photoThreshold}`, {
          method: 'POST',
          body: form,
          headers: form.getHeaders()
        });

        if (!response.ok) {
          throw new Error(`Online service error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        res.json(result);

      } catch (error) {
        console.error('PDF analysis fallback error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Calculate price endpoint - forward to online Laravel service
    app.post('/calculate-price', multer().single('file'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        // Forward request to online Laravel service
        const form = new FormData();
        form.append('file', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype
        });

        // Add query parameters if provided
        const queryParams = new URLSearchParams();
        if (req.query.slug) queryParams.append('slug', req.query.slug);
        if (req.query.price_setting_photo) queryParams.append('price_setting_photo', req.query.price_setting_photo);
        if (req.query.price_setting_color) queryParams.append('price_setting_color', req.query.price_setting_color);
        if (req.query.price_setting_bw) queryParams.append('price_setting_bw', req.query.price_setting_bw);
        if (req.query.threshold_color) queryParams.append('threshold_color', req.query.threshold_color);
        if (req.query.threshold_photo) queryParams.append('threshold_photo', req.query.threshold_photo);

        const queryString = queryParams.toString();
        const url = `${CONFIG.SERVER_URL}/calculate-price${queryString ? '?' + queryString : ''}`;

        const response = await fetch(url, {
          method: 'POST',
          body: form,
          headers: form.getHeaders()
        });

        if (!response.ok) {
          throw new Error(`Online service error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        // Mark as fallback mode
        result.analysis_mode = 'online_fallback';
        
        res.json(result);

      } catch (error) {
        console.error('Calculate price fallback error:', error);
        
        // Fallback result
        const fallbackResult = {
          price_color: 0,
          price_bw: 0,
          price_photo: 0,
          total_price: 0,
          file_url: null,
          file_name: req.file ? req.file.originalname : 'unknown',
          file_type: req.file ? req.file.mimetype : 'unknown',
          analysis_mode: 'online_fallback_error',
          service_available: false,
          pengaturan: {
            threshold_warna: '20',
            threshold_foto: '30',
            price_setting_color: 1000,
            price_setting_bw: 500,
            price_setting_photo: 2000,
          },
          color_pages: 0,
          bw_pages: 0,
          photo_pages: 0,
          total_pages: 0,
          page_details: [],
          fallback: true,
          error: error.message
        };
        
        res.status(500).json(fallbackResult);
      }
    });

    // Start fallback proxy server
    localServer = app.listen(CONFIG.LOCAL_PORT, '127.0.0.1', () => {
      console.log(`Fallback proxy server running on port ${CONFIG.LOCAL_PORT}, forwarding to online service`);
      updateLoadingStatus('Online service ready! Loading application...');
      resolve();
    });

    localServer.on('error', (error) => {
      console.error('Fallback proxy server error:', error);
      console.error('Error code:', error.code);
      console.error('Error port:', error.port);
      console.error('Error address:', error.address);
      
      // Windows-specific port binding issues
      if (process.platform === 'win32') {
        if (error.code === 'EADDRINUSE') {
          console.error(`Windows: Port ${CONFIG.LOCAL_PORT} is already in use`);
        } else if (error.code === 'EACCES') {
          console.error(`Windows: Permission denied for port ${CONFIG.LOCAL_PORT} - may need admin rights`);
        } else if (error.code === 'EADDRNOTAVAIL') {
          console.error('Windows: Address not available - check network configuration');
        }
      }
      
      updateLoadingStatus('Service setup failed...');
      reject(error);
    });
  });
}

// Get Python executable path
function getPythonExecutablePath() {
  const isPackaged = app.isPackaged;
  const basePath = isPackaged 
    ? path.join(process.resourcesPath, 'python-service')
    : path.join(__dirname, '../python-service');
    
  const platform = process.platform;
  
  // Improved file detection for different platforms
  let exeName;
  if (platform === 'win32') {
    // Try multiple possible names for Windows
    const possibleNames = ['pdf_analyzer.exe', 'pdf_analyzer'];
    
    for (const name of possibleNames) {
      const fullPath = path.join(basePath, name);
      if (fs.existsSync(fullPath)) {
        console.log(`Found Python executable: ${fullPath}`);
        return fullPath;
      }
    }
    
    // Fallback to default name
    exeName = 'pdf_analyzer.exe';
  } else {
    exeName = 'pdf_analyzer';
  }
  
  return path.join(basePath, exeName);
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom + 1);
            }
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom - 1);
            }
          }
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.setZoomLevel(0);
            }
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'Cetak Cerdas',
              detail: 'Desktop application for print management with local PDF processing capabilities.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Setup IPC handlers
function setupIpcHandlers() {
  // Handle print document request
  ipcMain.handle('print-document', async (event, url) => {
    console.log('🖨️ Print document request received with URL:', url);
    try {
      if (!mainWindow) {
        console.error('❌ Main window not available');
        throw new Error('Main window not available');
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
      
      console.log('📄 Loading document URL:', url);
      // Load the document URL
      await printWindow.loadURL(url);
      
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
}

// Helper function to generate file hash
function generateFileHash(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(fileBuffer).digest('hex');
  } catch (error) {
    console.error('Error generating file hash:', error);
    return Date.now().toString();
  }
}

// Setup additional IPC handlers for local file operations
function setupLocalFileHandlers() {
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
      fileBrowserWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js')
        },
        title: 'Local File Browser - Cetak Cerdas',
        icon: path.join(__dirname, '../assets/icon.png')
      });
      
      // Load the main application but with a special parameter for file browser mode
      if (CONFIG.isDev) {
        fileBrowserWindow.loadURL('http://localhost:8000/protected-print?mode=file-browser');
      } else {
        fileBrowserWindow.loadURL(`${CONFIG.SERVER_URL}/protected-print?mode=file-browser`);
      }
      
      fileBrowserWindow.on('closed', () => {
        fileBrowserWindow = null;
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error opening file browser:', error);
      return { success: false, error: error.message };
    }
  });

  // Analysis cache handlers
  ipcMain.handle('save-analysis-result', async (event, fileData) => {
    try {
      const analyzedFiles = analysisStore.get('analyzedFiles', []);
      
      const newEntry = {
        id: fileData.id || Date.now().toString(),
        filePath: fileData.filePath,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        lastModified: fileData.lastModified,
        analysisResult: fileData.analysisResult,
        analyzedAt: Date.now(),
        fileHash: fileData.fileHash || generateFileHash(fileData.filePath)
      };
      
      analyzedFiles.push(newEntry);
      
      // Keep only last 100 entries
      if (analyzedFiles.length > 100) {
        analyzedFiles.splice(0, analyzedFiles.length - 100);
      }
      
      analysisStore.set('analyzedFiles', analyzedFiles);
      
      return { success: true, id: newEntry.id };
    } catch (error) {
      console.error('Error saving analysis result:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-analysis-history', async () => {
    try {
      return analysisStore.get('analyzedFiles', []);
    } catch (error) {
      console.error('Error getting analysis history:', error);
      return [];
    }
  });

  // Local file analysis handler
  ipcMain.handle('analyze-local-file', async (event, fileData) => {
    try {
      const { filePath, fileName } = fileData;
      
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }
      
      // Read file and create form data for analysis
      const fileBuffer = fs.readFileSync(filePath);
      const form = new FormData();
      form.append('file', fileBuffer, {
        filename: fileName,
        contentType: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      // Use local Python service if available
      const pythonPort = pythonServicePort;
      const response = await fetch(`http://127.0.0.1:${pythonPort}/analyze-document?color_threshold=20&photo_threshold=30`, {
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
        file_url: `file://${filePath}`,
        file_name: fileName,
        analysis_mode: 'local_desktop',
        service_available: true,
        pengaturan: {
          threshold_warna: '20',
          threshold_foto: '30',
          price_setting_color: priceSettingColor,
          price_setting_bw: priceSettingBw,
          price_setting_photo: priceSettingPhoto,
        }
      };
      
      return result;
    } catch (error) {
      console.error('Local file analysis error:', error);
      return {
        success: false,
        error: error.message,
        fallback: true
      };
    }
  });

  // Print settings handlers
  ipcMain.handle('get-print-settings', async () => {
    try {
      return analysisStore.get('printSettings', {
        paperSize: 'A4',
        orientation: 'portrait',
        quality: 'normal',
        copies: 1,
        duplex: false
      });
    } catch (error) {
      console.error('Error getting print settings:', error);
      return {
        paperSize: 'A4',
        orientation: 'portrait',
        quality: 'normal',
        copies: 1,
        duplex: false
      };
    }
  });

  ipcMain.handle('save-print-settings', async (event, settings) => {
    try {
      analysisStore.set('printSettings', settings);
      return { success: true };
    } catch (error) {
      console.error('Error saving print settings:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('clear-analysis-cache', async () => {
    try {
      analysisStore.set('analyzedFiles', []);
      return { success: true };
    } catch (error) {
      console.error('Error clearing analysis cache:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-file-info', async (event, filePath) => {
    try {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        lastModified: stats.mtime.getTime(),
        isFile: stats.isFile(),
        exists: true
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return { exists: false, error: error.message };
    }
  });

  // Enhanced print handler
  ipcMain.handle('print-local-file-enhanced', async (event, options) => {
    try {
      const { filePath, printSettings } = options;
      
      console.log('🖨️ Enhanced print request:', { filePath, printSettings });
      
      // Check file extension
      const fileExtension = filePath.toLowerCase().split('.').pop();
      const isDocxFile = fileExtension === 'docx';
      
      if (isDocxFile) {
        console.log('📄 DOCX file detected, using system default application');
        
        // For DOCX files, try to open with system default application
        try {
          const actualFilePath = filePath.startsWith('file://') ? filePath.replace('file://', '') : filePath;
          
          // Check if file exists
          if (!fs.existsSync(actualFilePath)) {
            throw new Error('DOCX file not found');
          }
          
          // Open with system default application
          await shell.openPath(actualFilePath);
          
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

// App event handlers
app.whenReady().then(async () => {
  try {
    // Setup IPC handlers
    setupIpcHandlers();
    setupLocalFileHandlers();
    
    // Create loading window first
    createLoadingWindow();
    
    if (!CONFIG.isDev) {
      // Try to start Python service for local PDF analysis
      try {
        await startPythonService();
        console.log('Python service ready, application loaded from cetakcerdas.com');
      } catch (error) {
        console.error('Failed to start local Python service:', error);
        console.log('Continuing with server fallback only - all PDF analysis will use online service');
        
        // Start a simple proxy that always forwards to online service
        await startFallbackProxy();
      }
    } else {
      // In dev mode, just mark services as ready
      updateLoadingStatus('Development mode - Loading application...');
    }
    
    // Wait a moment for services to fully initialize, then create main window
    setTimeout(() => {
      createWindow();
    }, 1000);
    
  } catch (error) {
    console.error('Failed to start services:', error);
    console.log('Continuing with basic functionality only');
    updateLoadingStatus('Service setup failed, loading anyway...');
    
    // Still create the main window even if services fail
    setTimeout(() => {
      createWindow();
    }, 2000);
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
  // Clean up services
  if (laravelProcess) {
    laravelProcess.kill();
  }
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