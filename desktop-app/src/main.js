const { app, BrowserWindow, Menu, dialog, shell, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Configuration
const CONFIG = {
  SERVER_URL: process.env.SERVER_URL || 'https://your-laravel-server.com', // Replace with your actual server URL
  LOCAL_PORT: 3001,
  PYTHON_PORT: 9006,
  isDev: process.argv.includes('--dev')
};

let mainWindow;
let pythonProcess;
let localServer;

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
    // Production mode - load from local server
    mainWindow.loadURL(`http://localhost:${CONFIG.LOCAL_PORT}`);
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (!CONFIG.isDev) {
      // Show loading message
      showLoadingMessage();
    }
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
}

// Show loading message while services start
function showLoadingMessage() {
  const loadingHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Loading...</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .loading-container {
                text-align: center;
                padding: 2rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                backdrop-filter: blur(10px);
            }
            .spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            h2 { margin: 0 0 1rem 0; }
            p { margin: 0; opacity: 0.8; }
        </style>
    </head>
    <body>
        <div class="loading-container">
            <div class="spinner"></div>
            <h2>Print Management System</h2>
            <p>Starting services...</p>
        </div>
    </body>
    </html>
  `;
  
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHtml)}`);
}

// Start Python service
function startPythonService() {
  return new Promise((resolve, reject) => {
    const pythonExePath = getPythonExecutablePath();
    
    if (!fs.existsSync(pythonExePath)) {
      console.error('Python executable not found:', pythonExePath);
      reject(new Error('Python service executable not found'));
      return;
    }

    console.log('Starting Python service:', pythonExePath);
    
    pythonProcess = spawn(pythonExePath, ['--mode', 'server', '--host', '127.0.0.1', '--port', CONFIG.PYTHON_PORT.toString()], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    pythonProcess.stdout.on('data', (data) => {
      console.log('Python service:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python service error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      console.log('Python service exited with code:', code);
    });

    // Wait for service to be ready
    setTimeout(() => {
      checkPythonService()
        .then(() => resolve())
        .catch(() => reject(new Error('Python service failed to start')));
    }, 3000);
  });
}

// Check if Python service is running
async function checkPythonService() {
  try {
    const response = await fetch(`http://127.0.0.1:${CONFIG.PYTHON_PORT}/health`);
    return response.ok;
  } catch (error) {
    throw error;
  }
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

// Start local proxy server
function startLocalServer() {
  return new Promise((resolve, reject) => {
    const app = express();
    
    app.use(cors());
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../frontend-build')));

    // Proxy API requests to main server
    app.use('/api', async (req, res) => {
      try {
        const url = `${CONFIG.SERVER_URL}${req.originalUrl}`;
        const options = {
          method: req.method,
          headers: {
            ...req.headers,
            host: undefined // Remove host header
          }
        };

        if (req.method !== 'GET' && req.method !== 'HEAD') {
          options.body = JSON.stringify(req.body);
          options.headers['content-type'] = 'application/json';
        }

        const response = await fetch(url, options);
        const data = await response.text();
        
        res.status(response.status);
        response.headers.forEach((value, key) => {
          res.set(key, value);
        });
        res.send(data);
      } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy error' });
      }
    });

    // Handle PDF analysis locally
    app.post('/analyze-document-local', multer().single('file'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const formData = new FormData();
        formData.append('file', req.file.buffer, req.file.originalname);

        const colorThreshold = req.body.color_threshold || 10.0;
        const photoThreshold = req.body.photo_threshold || 30.0;

        const response = await fetch(
          `http://127.0.0.1:${CONFIG.PYTHON_PORT}/analyze-document?color_threshold=${colorThreshold}&photo_threshold=${photoThreshold}`,
          {
            method: 'POST',
            body: formData
          }
        );

        if (!response.ok) {
          throw new Error(`Python service error: ${response.status}`);
        }

        const result = await response.json();
        res.json(result);
      } catch (error) {
        console.error('Local analysis error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Serve frontend for all other routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../frontend-build/index.html'));
    });

    localServer = app.listen(CONFIG.LOCAL_PORT, '127.0.0.1', () => {
      console.log(`Local server running on port ${CONFIG.LOCAL_PORT}`);
      resolve();
    });

    localServer.on('error', (error) => {
      console.error('Local server error:', error);
      reject(error);
    });
  });
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
              message: 'Print Management System',
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
    if (!CONFIG.isDev) {
      // Start services in production mode
      await startPythonService();
      await startLocalServer();
    }
    
    createWindow();
  } catch (error) {
    console.error('Failed to start services:', error);
    dialog.showErrorBox('Startup Error', `Failed to start application services: ${error.message}`);
    app.quit();
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