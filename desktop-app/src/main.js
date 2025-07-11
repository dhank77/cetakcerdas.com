const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const fetch = require('node-fetch');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const os = require('os');

// Configuration
const CONFIG = {
  SERVER_URL: process.env.SERVER_URL || 'https://cetakcerdas.com',
  PYTHON_PORT: 9006, // Must match the hardcoded port in Python executable
  isDev: process.argv.includes('--dev')
};

let mainWindow;
let pythonProcess;
let localServer;
let laravelProcess;

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

  // Load the application
  if (CONFIG.isDev) {
    // Development mode - connect to Laravel dev server
    mainWindow.loadURL('http://localhost:8000');
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - load cetakcerdas.com directly
    mainWindow.loadURL(CONFIG.SERVER_URL);
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Create application menu
  createMenu();
  
  // Intercept requests to handle local PDF analysis
  mainWindow.webContents.session.webRequest.onBeforeRequest(
    { urls: ['*://cetakcerdas.com/calculate-price', '*://www.cetakcerdas.com/calculate-price'] },
    (details, callback) => {
      // Redirect to local Python service for PDF analysis
      console.log('Intercepting calculate-price request for local analysis');
      callback({ redirectURL: `http://127.0.0.1:${CONFIG.PYTHON_PORT}/analyze-document` });
    }
  );
}

// Start Python service in server mode
function startPythonService() {
  return new Promise((resolve, reject) => {
    const pythonExePath = getPythonExecutablePath();
    
    if (!fs.existsSync(pythonExePath)) {
      console.error('Python executable not found:', pythonExePath);
      reject(new Error('Python service executable not found'));
      return;
    }

    console.log('Starting Python service in server mode:', pythonExePath);
    
    // Start Python server
    const pythonPort = CONFIG.PYTHON_PORT + 1; // Use different port for Python server
    pythonProcess = spawn(pythonExePath, ['--mode', 'server', '--host', '127.0.0.1', '--port', pythonPort.toString()], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
        OBJC_DISABLE_INITIALIZE_FORK_SAFETY: 'YES',
        PYTHONDONTWRITEBYTECODE: '1'
      }
    });

    let serverReady = false;
    
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Python server:', output);
      if (output.includes('Uvicorn running on') || output.includes('Server started') || output.includes('Application startup complete')) {
        serverReady = true;
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      const output = data.toString();
      console.log('Python server info:', output);
      if (output.includes('Uvicorn running on') || output.includes('Server started') || output.includes('Application startup complete')) {
        serverReady = true;
      }
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python server exited with code ${code}`);
      pythonProcess = null;
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python server:', error);
      reject(error);
      return;
    });

    // Wait for server to be ready, then start proxy
    const checkReady = setInterval(() => {
      if (serverReady) {
        clearInterval(checkReady);
        startProxyServer(pythonPort).then(resolve).catch(reject);
      }
    }, 50);

    // Timeout after 20 seconds
    setTimeout(() => {
      if (!serverReady) {
        clearInterval(checkReady);
        // Even if we didn't detect ready state, try to start proxy anyway
        console.log('Timeout reached, attempting to start proxy anyway...');
        startProxyServer(pythonPort).then(resolve).catch(reject);
      }
    }, 20000);
  });
}

// Start proxy server that forwards requests to Python server
function startProxyServer(pythonPort) {
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
        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype
        });

        const response = await fetch(`http://127.0.0.1:${pythonPort}/analyze-document?color_threshold=${colorThreshold}&photo_threshold=${photoThreshold}`, {
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

    // Start proxy server
    localServer = app.listen(CONFIG.PYTHON_PORT, '127.0.0.1', () => {
      console.log(`Local proxy server running on port ${CONFIG.PYTHON_PORT}, forwarding to Python server on port ${pythonPort}`);
      resolve();
    });

    localServer.on('error', (error) => {
      console.error('Local proxy server error:', error);
      reject(error);
    });
  });
}

// Start fallback proxy that forwards all requests to online service
function startFallbackProxy() {
  return new Promise((resolve, reject) => {
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
        const FormData = require('form-data');
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

    // Start fallback proxy server
    localServer = app.listen(CONFIG.PYTHON_PORT, '127.0.0.1', () => {
      console.log(`Fallback proxy server running on port ${CONFIG.PYTHON_PORT}, forwarding to online service`);
      resolve();
    });

    localServer.on('error', (error) => {
      console.error('Fallback proxy server error:', error);
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
  const exeName = platform === 'win32' ? 'pdf_analyzer.exe' : 'pdf_analyzer';
  
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

// App event handlers
app.whenReady().then(async () => {
  try {
    createWindow(); // Create window first
    
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
    }
  } catch (error) {
    console.error('Failed to start services:', error);
    console.log('Continuing with basic functionality only');
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