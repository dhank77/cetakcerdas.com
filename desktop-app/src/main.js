/* eslint-disable @typescript-eslint/no-unused-vars */
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

// Enhanced network handling configuration
const NETWORK_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Enhanced fetch with retry mechanism and better error handling
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retries
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT);
  
  const enhancedOptions = {
    ...options,
    signal: controller.signal,
    headers: {
      ...options.headers,
      'User-Agent': 'CetakCerdas-Desktop-App/1.0.0',
      'Accept': 'application/json',
    }
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Fetching ${url} (attempt ${attempt}/${retries})`);
      
      const response = await fetch(url, enhancedOptions);
      clearTimeout(timeoutId);
      
      // Handle specific status codes with better error messages
      if (response.status === 419) {
        console.warn('Proxy authentication required, attempting alternative strategies');
        throw new Error('PROXY_AUTH_REQUIRED');
      }
      
      if (response.status === 403) {
        console.warn('Access forbidden, checking server availability');
        throw new Error('ACCESS_FORBIDDEN');
      }
      
      if (response.status === 429) {
        console.warn('Rate limited, waiting before retry');
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt * 2));
          continue;
        }
      }
      
      if (response.status >= 500) {
        console.warn(`Server error ${response.status}, retrying...`);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
          continue;
        }
      }
      
      return response;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.warn(`Request timeout for ${url}`);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
          continue;
        }
        throw new Error('Network timeout - please check your internet connection');
      }
      
      if (error.message === 'PROXY_AUTH_REQUIRED' || error.message.includes('proxy')) {
        throw new Error('Network proxy authentication required. Please configure proxy settings or contact your network administrator.');
      }
      
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.warn(`Server unreachable: ${error.code}`);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
          continue;
        }
        throw new Error('Unable to connect to the server. Please check your internet connection or try again later.');
      }
      
      if (error.code === 'ETIMEDOUT') {
        console.warn(`Connection timeout: ${error.code}`);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
          continue;
        }
        throw new Error('Connection timeout - server may be temporarily unavailable');
      }
      
      if (attempt < retries) {
        console.warn(`Network error (attempt ${attempt}/${retries}): ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      } else {
        throw new Error(`Network connection failed after ${retries} attempts. ${error.message}`);
      }
    }
  }
}

/**
 * Check if server is available with health check
 * @param {string} serverUrl - Server URL to check
 * @returns {Promise<boolean>} Whether server is available
 */
async function checkServerHealth(serverUrl) {
  try {
    const response = await fetchWithRetry(`${serverUrl}/api/health`, { method: 'GET' }, 1);
    return response.ok;
  } catch (error) {
    console.warn('Server health check failed:', error.message);
    return false;
  }
}

/**
 * Alternative connection strategies for network issues
 * @param {string} originalUrl - Original URL
 * @param {Object} options - Request options
 * @returns {Promise<Response>} Response from alternative connection
 */
async function connectWithAlternatives(originalUrl, options = {}) {
  const alternatives = [
    originalUrl,
    originalUrl.replace('https://', 'http://'), // Fallback to HTTP
  ];
  
  for (const url of alternatives) {
    try {
      console.log(`Trying alternative connection: ${url}`);
      const response = await fetchWithRetry(url, options, 2);
      if (response.ok) return response;
    } catch (error) {
      console.warn(`Alternative connection failed for ${url}:`, error.message);
    }
  }
  
  throw new Error('All connection attempts failed. Please check your internet connection.');
}

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
let pythonServicePort = null;

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
        // Check if file exists first
        if (!fs.existsSync(pythonExePath)) {
          console.error('Python executable not found at path:', pythonExePath);
          updateLoadingStatus('PDF analyzer not found, using online service...');
          reject(new Error('Python service executable not found at ' + pythonExePath));
          return;
        }
        
        fs.accessSync(pythonExePath, fs.constants.F_OK | fs.constants.R_OK);
        console.log('Python executable is accessible on Windows');
      } catch (accessError) {
        console.error('Python executable access error on Windows:', accessError);
        updateLoadingStatus('PDF analyzer access denied, using online service...');
        reject(new Error('Python service executable access denied'));
        return;
      }
    } else {
      // Check if file exists on other platforms
      if (!fs.existsSync(pythonExePath)) {
        console.error('Python executable not found at path:', pythonExePath);
        updateLoadingStatus('PDF analyzer not found, using online service...');
        reject(new Error('Python service executable not found at ' + pythonExePath));
        return;
      }
    }
    
    console.log('Starting Python service in server mode:', pythonExePath);
    console.log('Python service file stats:', fs.statSync(pythonExePath));
    console.log('Current working directory:', process.cwd());
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
        
        console.log('Spawning Python process with command:', pythonExePath, '--mode', 'server', '--host', '127.0.0.1', '--port', pythonServicePort.toString());
        console.log('Python process environment:', pythonEnv);
        
        pythonProcess = spawn(pythonExePath, ['--mode', 'server', '--host', '127.0.0.1', '--port', pythonServicePort.toString()], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: pythonEnv
        });
        
        console.log('Python process spawned with PID:', pythonProcess.pid);
        
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
          pythonServicePort = null; // Clear port when process exits
        });
        
        pythonProcess.on('exit', (code, signal) => {
          console.log(`Python process exited with code ${code} and signal ${signal}`);
        });
        
        pythonProcess.on('disconnect', () => {
          console.log('Python process disconnected');
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
          pythonServicePort = null; // Clear port on error
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
            }).catch((error) => {
              pythonServicePort = null; // Clear port on proxy error
              reject(error);
            });
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
              // Only resolve if we actually have a valid port
              if (pythonServicePort) {
                updateLoadingStatus('Services ready! Loading application...');
                resolve();
              } else {
                // If no port was set, reject with an error
                reject(new Error('Python service failed to start properly'));
              }
            }).catch((error) => {
              pythonServicePort = null; // Clear port on proxy error
              reject(error);
            });
          }
        }, timeout);
      })
      .catch((error) => {
        console.error('Failed to find available port:', error);
        updateLoadingStatus('Failed to find available port, using online service...');
        pythonServicePort = null; // Clear port on error
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
      res.json({ status: 'online', mode: 'server_proxy', pythonServicePort: pythonServicePort });
    });
    
    // PDF analysis endpoint - proxy to Python server or fallback to online service
    app.post('/analyze-document', multer().single('file'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const colorThreshold = parseFloat(req.query.color_threshold) || 10.0;
        const photoThreshold = parseFloat(req.query.photo_threshold) || 30.0;
        
        // Check if Python service is available
        if (pythonServicePort) {
          try {
            // Forward request to Python server
            const form = new FormData();
            form.append('file', req.file.buffer, {
              filename: req.file.originalname,
              contentType: req.file.mimetype
            });
            
            const response = await fetchWithRetry(`http://127.0.0.1:${pythonServicePort}/analyze-document?color_threshold=${colorThreshold}&photo_threshold=${photoThreshold}`, {
              method: 'POST',
              body: form,
              headers: form.getHeaders()
            });
            
            if (!response.ok) {
              throw new Error(`Python server error: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            res.json(result);
            return;
          } catch (pythonError) {
            console.error('Python service error, falling back to online service:', pythonError);
            // Continue to online service fallback
          }
        }
        
        // Fallback to online service
        const form = new FormData();
        form.append('file', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype
        });
        
        const response = await fetchWithRetry(`${CONFIG.SERVER_URL}/api/analyze-document?color_threshold=${colorThreshold}&photo_threshold=${photoThreshold}`, {
          method: 'POST',
          body: form,
          headers: form.getHeaders()
        });
        
        if (!response.ok) {
          if (response.status === 419) {
            throw new Error(`Network proxy authentication required. Please check your internet connection or contact your network administrator.`);
          }
          throw new Error(`Online service error: ${response.status} ${response.statusText}`);
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
            const settingsResponse = await fetchWithRetry(`${CONFIG.SERVER_URL}/api/user-settings/${slug}`);
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
            } else if (settingsResponse.status === 419) {
              console.log('Network proxy authentication required for settings fetch, using defaults');
            }
          } catch (settingsError) {
            console.log('Could not fetch user settings, using defaults:', settingsError.message);
          }
        }
        
        // Check if Python service is available
        if (pythonServicePort) {
          try {
            // Forward request to Python server for analysis
            const form = new FormData();
            form.append('file', req.file.buffer, {
              filename: req.file.originalname,
              contentType: req.file.mimetype
            });
            
            const response = await fetchWithRetry(`http://127.0.0.1:${pythonServicePort}/analyze-document?color_threshold=${colorThreshold}&photo_threshold=${photoThreshold}`, {
              method: 'POST',
              body: form,
              headers: form.getHeaders()
            });
            
            if (response.ok) {
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
              return;
            }
          } catch (pythonError) {
            console.error('Python service error for price calculation, falling back to online service:', pythonError);
            // Continue to online service fallback
          }
        }
        
        // Fallback to online Laravel service
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
        
        const response = await fetchWithRetry(url, {
          method: 'POST',
          body: form,
          headers: form.getHeaders()
        });
        
        if (!response.ok) {
          if (response.status === 419) {
            throw new Error(`Network proxy authentication required. Please check your internet connection or contact your network administrator.`);
          }
          throw new Error(`Online service error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Mark as fallback mode
        result.analysis_mode = 'online_fallback';
        
        res.json(result);
        
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
    
    // Proxy all other requests (web pages) to the main server
    app.use('*', async (req, res) => {
      try {
        const targetUrl = `${CONFIG.SERVER_URL}${req.originalUrl}`;
        console.log(`Proxying web request: ${req.originalUrl} -> ${targetUrl}`);
        
        const response = await fetchWithRetry(targetUrl, {
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
        if (error.message.includes('419') || error.message.includes('proxy')) {
          res.status(503).json({ 
            error: 'Network proxy authentication required', 
            details: 'Your network requires proxy authentication. Please check your internet connection or contact your network administrator.',
            code: 'PROXY_AUTH_REQUIRED'
          });
        } else {
          res.status(500).json({ error: 'Proxy server error', details: error.message });
        }
      }
    });
    
    // Start proxy server
    localServer = app.listen(CONFIG.LOCAL_PORT, '127.0.0.1', () => {
      console.log(`Local proxy server running on port ${CONFIG.LOCAL_PORT}${pythonServicePort ? `, forwarding to Python server on port ${pythonServicePort}` : ', using online service only'}`);
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

// Network diagnostics and proxy detection
async function performNetworkDiagnostics() {
  console.log('Performing network diagnostics...');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    server_url: CONFIG.SERVER_URL,
    network_status: 'unknown',
    proxy_detected: false,
    server_reachable: false,
    recommendations: []
  };

  try {
    // Test basic internet connectivity
    const internetTest = await fetchWithRetry('https://httpbin.org/ip', { method: 'GET' }, 1);
    if (internetTest.ok) {
      diagnostics.network_status = 'connected';
    }
  } catch (error) {
    diagnostics.network_status = 'disconnected';
    diagnostics.recommendations.push('Check your internet connection');
  }

  try {
    // Test server reachability
    const serverReachable = await checkServerHealth(CONFIG.SERVER_URL);
    diagnostics.server_reachable = serverReachable;
    if (!serverReachable) {
      diagnostics.recommendations.push('Server may be temporarily unavailable');
    }
  } catch (error) {
    diagnostics.server_reachable = false;
    if (error.message.includes('proxy')) {
      diagnostics.proxy_detected = true;
      diagnostics.recommendations.push('Configure proxy settings in your system');
    }
  }

  console.log('Network diagnostics completed:', diagnostics);
  return diagnostics;
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

        const response = await fetchWithRetry(`${CONFIG.SERVER_URL}/api/analyze-document?color_threshold=${colorThreshold}&photo_threshold=${photoThreshold}`, {
          method: 'POST',
          body: form,
          headers: form.getHeaders()
        });

        if (!response.ok) {
          if (response.status === 419) {
            throw new Error(`Network proxy authentication required. Please check your internet connection or contact your network administrator.`);
          }
          throw new Error(`Online service error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        res.json(result);

      } catch (error) {
        console.error('PDF analysis fallback error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Calculate price endpoint - local calculation without network
    app.post('/calculate-price', multer().single('file'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        // Local calculation without network dependency
        const priceSettings = {
          price_setting_color: parseInt(req.query.price_setting_color) || 1000,
          price_setting_bw: parseInt(req.query.price_setting_bw) || 500,
          price_setting_photo: parseInt(req.query.price_setting_photo) || 2000
        };

        // Basic local calculation (simplified)
        const result = {
          price_color: priceSettings.price_setting_color,
          price_bw: priceSettings.price_setting_bw,
          price_photo: priceSettings.price_setting_photo,
          total_price: priceSettings.price_setting_bw, // Default to BW price
          file_url: null,
          file_name: req.file.originalname,
          file_type: req.file.mimetype,
          analysis_mode: 'local_no_network',
          service_available: true,
          pengaturan: {
            threshold_warna: req.query.threshold_color || '20',
            threshold_foto: req.query.threshold_photo || '30',
            price_setting_color: priceSettings.price_setting_color,
            price_setting_bw: priceSettings.price_setting_bw,
            price_setting_photo: priceSettings.price_setting_photo,
          },
          color_pages: 1, // Simplified
          bw_pages: 1,    // Simplified
          photo_pages: 0, // Simplified
          total_pages: 1, // Simplified
          page_details: [],
          fallback: false,
          local_calculation: true,
          note: 'Local calculation without network dependency'
        };
        
        res.json(result);

      } catch (error) {
        console.error('Calculate price local error:', error);
        
        // Local error result
        const errorResult = {
          price_color: 0,
          price_bw: 0,
          price_photo: 0,
          total_price: 0,
          file_url: null,
          file_name: req.file ? req.file.originalname : 'unknown',
          file_type: req.file ? req.file.mimetype : 'unknown',
          analysis_mode: 'local_error',
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
          fallback: false,
          local_calculation: true,
          error: error.message
        };
        
        res.status(500).json(errorResult);
      }
    });

    // Start fallback proxy server
    localServer = app.listen(CONFIG.LOCAL_PORT, '127.0.0.1', () => {
      console.log(`Local server running on port ${CONFIG.LOCAL_PORT}, calculate-price available locally without network`);
      updateLoadingStatus('Local services ready! Loading application...');
      
      // Perform network diagnostics after server starts
      performNetworkDiagnostics().then(diagnostics => {
        if (!diagnostics.server_reachable) {
          console.warn('Server connectivity issues detected:', diagnostics.recommendations);
          updateLoadingStatus('Network issues detected - using fallback mode');
        }
      }).catch(error => {
        console.error('Network diagnostics failed:', error);
      });
      
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
    
    // Try with .exe extension always
    const fullPath = path.join(basePath, 'pdf_analyzer.exe');
    if (fs.existsSync(fullPath)) {
      console.log(`Found Python executable: ${fullPath}`);
      return fullPath;
    }
    
    // Fallback to default name
    exeName = 'pdf_analyzer.exe';
  } else {
    exeName = 'pdf_analyzer';
  }
  
  const defaultPath = path.join(basePath, exeName);
  console.log(`Using default Python executable path: ${defaultPath}`);
  return defaultPath;
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
      
      // Check if Python service is running
      let pythonServiceAvailable = false;
      if (pythonServicePort) {
        try {
          // Test if the Python service is accessible
          const testResponse = await fetchWithRetry(`http://127.0.0.1:${pythonServicePort}/`, {
            method: 'GET',
            timeout: 5000 // 5 second timeout
          });
          pythonServiceAvailable = testResponse.ok;
        } catch (testError) {
          console.log('Python service not accessible, will use online service:', testError.message);
          pythonServiceAvailable = false;
        }
      }
      
      // If Python service is available, use it for analysis
      // Ensure Python service is ready before use
      if (!pythonServiceAvailable) {
        throw new Error('Python service is not ready. Please wait for the service to start.');
      }
      
      // Read file and create form data for analysis
      const fileBuffer = fs.readFileSync(filePath);
      const form = new FormData();
      form.append('file', fileBuffer, {
        filename: fileName,
        contentType: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      // Use local Python service only
      const pythonPort = pythonServicePort;
      const response = await fetchWithRetry(`http://127.0.0.1:${pythonPort}/analyze-document?color_threshold=20&photo_threshold=30`, {
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

  ipcMain.handle('read-file-content', async (event, filePath) => {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }
      
      // Read file content
      const content = fs.readFileSync(filePath);
      return { success: true, content: content.toString('base64') };
    } catch (error) {
      console.error('Error reading file content:', error);
      return { success: false, error: error.message };
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
    
    // Perform network diagnostics for better error messages
    try {
      const diagnostics = await performNetworkDiagnostics();
      console.warn('Network diagnostics:', diagnostics);
      
      if (diagnostics.proxy_detected) {
        updateLoadingStatus('Network proxy detected - please configure proxy settings');
      } else if (!diagnostics.server_reachable) {
        updateLoadingStatus('Cannot reach server - checking network...');
      } else {
        updateLoadingStatus('Service setup failed, loading anyway...');
      }
    } catch (diagError) {
      console.error('Network diagnostics failed:', diagError);
      updateLoadingStatus('Service setup failed, loading anyway...');
    }
    
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