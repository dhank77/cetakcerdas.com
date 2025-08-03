import { spawn, execSync } from 'child_process';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { CONFIG } from '../config.js';
import { findAvailablePort } from '../utils/port.js';
import { updateLoadingStatus } from '../windows/window-manager.js';
import { startProxyServer } from './proxy-server.js';

// ES6 module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global variables
export let pythonProcess;
export let pythonServicePort = null;

// Get Python executable path
export function getPythonExecutablePath() {
  const isPackaged = app.isPackaged;
  const basePath = isPackaged
    ? path.join(process.resourcesPath, 'python-service')
    : path.join(__dirname, '../../python-service');
    
  const platform = process.platform;
  
  // Improved file detection for different platforms
  let exeName;
  if (platform === 'win32') {
    // Try direct executable first (most reliable)
    const possibleNames = ['pdf_analyzer.exe', 'pdf_analyzer'];
    
    for (const name of possibleNames) {
      const fullPath = path.join(basePath, name);
      if (fs.existsSync(fullPath)) {
        console.log(`Found Python executable: ${fullPath}`);
        return fullPath;
      }
    }
    
    // Try PowerShell script as fallback
    const psWrapperPath = path.join(basePath, 'run_python_utf8.ps1');
    if (fs.existsSync(psWrapperPath)) {
      console.log(`Found Python UTF-8 PowerShell wrapper: ${psWrapperPath}`);
      return psWrapperPath;
    }
    
    // Try batch file wrapper
    const batWrapperPath = path.join(basePath, 'run_python_utf8.bat');
    if (fs.existsSync(batWrapperPath)) {
      console.log(`Found Python UTF-8 batch wrapper: ${batWrapperPath}`);
      return batWrapperPath;
    }
    
    // Try Python wrapper script only if Python is available
     const pythonWrapperPath = path.join(basePath, 'python_wrapper.py');
     if (fs.existsSync(pythonWrapperPath)) {
       // Check if Python is available in system
       try {
         execSync('python --version', { stdio: 'ignore' });
         console.log(`Found Python UTF-8 wrapper script: ${pythonWrapperPath}`);
         return pythonWrapperPath;
       } catch {
         console.log('Python not available in system, skipping wrapper script');
       }
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

// Start Python service in server mode
export async function startPythonService() {
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
        
        // Environment variables
        const pythonEnv = {
          ...process.env,
          PYTHONUNBUFFERED: '1',
          PYTHONDONTWRITEBYTECODE: '1'
        };
        
        if (process.platform === 'darwin') {
          pythonEnv.OBJC_DISABLE_INITIALIZE_FORK_SAFETY = 'YES';
        }
        
        if (process.platform === 'win32') {
          pythonEnv.PYTHONIOENCODING = 'utf-8';
          pythonEnv.PYTHONUTF8 = '1';
        }
        
        // Spawn options
        const spawnOptions = {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: pythonEnv,
          windowsHide: process.platform === 'win32'
        };
        
        const pythonArgs = ['--mode', 'server', '--host', '127.0.0.1', '--port', pythonServicePort.toString()];
        
        let executablePath = pythonExePath;
        let executableArgs = pythonArgs;
        
        if (process.platform === 'win32') {
          if (pythonExePath.endsWith('.py')) {
            executablePath = 'python';
            executableArgs = [pythonExePath, ...pythonArgs];
          } else if (pythonExePath.endsWith('.ps1')) {
            executablePath = 'powershell.exe';
            executableArgs = ['-ExecutionPolicy', 'Bypass', '-File', pythonExePath, ...pythonArgs];
          }
        }
        
        pythonProcess = spawn(executablePath, executableArgs, spawnOptions);
        
        console.log('Python process spawned with PID:', pythonProcess.pid);
        
        let serverReady = false;
        
        pythonProcess.stdout.on('data', (data) => {
          const output = data.toString('utf8');
          console.log('Python server:', output);
          if (output.includes('Uvicorn running on') || output.includes('Server started') || output.includes('Application startup complete')) {
            serverReady = true;
            updateLoadingStatus('PDF analyzer ready!');
          }
        });
        
        pythonProcess.stderr.on('data', (data) => {
          const output = data.toString('utf8');
          console.log('Python server info:', output);
          if (output.includes('Uvicorn running on') || output.includes('Server started') || output.includes('Application startup complete')) {
            serverReady = true;
            updateLoadingStatus('PDF analyzer ready!');
          }
        });
        
        pythonProcess.on('close', (code) => {
          console.log(`Python server exited with code ${code}`);
          pythonProcess = null;
          pythonServicePort = null;
        });
        
        pythonProcess.on('error', (error) => {
          console.error('Failed to start Python server:', error);
          updateLoadingStatus('PDF analyzer failed, using online service...');
          pythonServicePort = null;
          reject(error);
        });
        
        // Wait for server to be ready
        const checkReady = setInterval(() => {
          if (serverReady) {
            clearInterval(checkReady);
            updateLoadingStatus('Starting local services...');
            startProxyServer().then(() => {
              updateLoadingStatus('Services ready! Loading application...');
              resolve();
            }).catch((error) => {
              pythonServicePort = null;
              reject(error);
            });
          }
        }, 100);
        
        setTimeout(() => {
          if (!serverReady) {
            clearInterval(checkReady);
            startProxyServer().then(() => {
              if (pythonServicePort) {
                resolve();
              } else {
                reject(new Error('Python service failed to start'));
              }
            }).catch(reject);
          }
        }, 20000);
      })
      .catch((error) => {
        console.error('Failed to find available port:', error);
        updateLoadingStatus('Failed to find available port, using online service...');
        pythonServicePort = null; // Clear port on error
        reject(error);
      });
  });
}