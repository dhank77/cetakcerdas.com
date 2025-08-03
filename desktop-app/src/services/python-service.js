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
    console.log('=== Starting Python Service ===');
    updateLoadingStatus('Initializing PDF analyzer...');
    
    const pythonExePath = getPythonExecutablePath();
    console.log('Python executable path:', pythonExePath);
    console.log('Python executable exists:', fs.existsSync(pythonExePath));
    console.log('Current working directory:', process.cwd());
    console.log('Platform:', process.platform);
    console.log('Target port for Python service:', CONFIG.PYTHON_PORT);
    
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
        console.log('Found available port for Python service:', availablePort);
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
        
        // Use wrapper scripts for better encoding handling
        if (process.platform === 'win32') {
          const serviceDir = path.dirname(pythonExePath);
          const wrapperBat = path.join(serviceDir, 'run_python_utf8.bat');
          const wrapperPs1 = path.join(serviceDir, 'run_python_utf8.ps1');
          
          if (fs.existsSync(wrapperBat)) {
            console.log('Using Windows batch wrapper for UTF-8 encoding');
            executablePath = wrapperBat;
            executableArgs = pythonArgs;
          } else if (fs.existsSync(wrapperPs1)) {
            console.log('Using PowerShell wrapper for UTF-8 encoding');
            executablePath = 'powershell.exe';
            executableArgs = ['-ExecutionPolicy', 'Bypass', '-File', wrapperPs1, ...pythonArgs];
          } else if (pythonExePath.endsWith('.py')) {
            executablePath = 'python';
            executableArgs = [pythonExePath, ...pythonArgs];
          }
        }
        
        pythonProcess = spawn(executablePath, executableArgs, spawnOptions);
        
        console.log('Python process spawned with PID:', pythonProcess.pid);
        
        let serverReady = false;
        
        pythonProcess.stdout.on('data', (data) => {
          try {
            const output = data.toString('utf8');
            console.log('Python server stdout:', JSON.stringify(output));
            // More flexible detection for server readiness
            if (output.includes('Uvicorn running on') || 
                output.includes('Server started') || 
                output.includes('Application startup complete') ||
                output.includes('Started server process') ||
                output.includes('Starting PDF Analyzer Server')) {
              console.log('Python service detected as ready from stdout');
              serverReady = true;
              updateLoadingStatus('PDF analyzer ready!');
            }
          } catch (encodingError) {
            console.warn('Encoding error in stdout:', encodingError.message);
            // Try with different encoding
            try {
              const output = data.toString('latin1');
              console.log('Python server stdout (latin1):', JSON.stringify(output));
            } catch (fallbackError) {
              console.warn('Fallback encoding also failed:', fallbackError.message);
            }
          }
        });
        
        pythonProcess.stderr.on('data', (data) => {
          try {
            const output = data.toString('utf8');
            console.log('Python server stderr:', JSON.stringify(output));
            
            // Check for encoding errors
            if (output.includes('UnicodeDecodeError') || output.includes('UnicodeEncodeError')) {
              console.error('Python service encoding error detected:', output);
              updateLoadingStatus('PDF analyzer encoding error, retrying...');
            }
            
            // More flexible detection for server readiness
            if (output.includes('Uvicorn running on') || 
                output.includes('Server started') || 
                output.includes('Application startup complete') ||
                output.includes('Started server process') ||
                output.includes('Starting PDF Analyzer Server')) {
              console.log('Python service detected as ready from stderr');
              serverReady = true;
              updateLoadingStatus('PDF analyzer ready!');
            }
          } catch (encodingError) {
            console.warn('Encoding error in stderr:', encodingError.message);
            // Try with different encoding
            try {
              const output = data.toString('latin1');
              console.log('Python server stderr (latin1):', JSON.stringify(output));
            } catch (fallbackError) {
              console.warn('Fallback encoding also failed:', fallbackError.message);
            }
          }
        });
        
        pythonProcess.on('close', (code, signal) => {
          console.log(`Python server exited with code ${code}, signal: ${signal}`);
          console.log('Executable path was:', executablePath);
          console.log('Executable args were:', executableArgs);
          
          // Provide more detailed exit information
          if (code !== 0) {
            console.error(`Python service crashed with exit code ${code}`);
            if (code === 9009) {
              console.error('Error 9009: This usually means the executable or a dependency was not found');
            } else if (code === 1) {
              console.error('Error 1: General error, check Python service logs above');
            }
          }
          
          pythonProcess = null;
          pythonServicePort = null;
        });
        
        pythonProcess.on('error', (error) => {
          console.error('Failed to start Python server:', error);
          console.error('Executable path:', executablePath);
          console.error('Executable args:', executableArgs);
          console.error('Working directory:', process.cwd());
          console.error('Python executable exists:', fs.existsSync(pythonExePath));
          
          // Provide detailed error information
          let errorMessage = 'Python service failed to start';
          if (error.code === 'ENOENT') {
            errorMessage = `Python executable not found: ${executablePath}`;
          } else if (error.code === 'EACCES') {
            errorMessage = `Permission denied accessing: ${executablePath}`;
          } else if (error.code === 'EPERM') {
            errorMessage = `Operation not permitted: ${executablePath}`;
          } else if (error.message && error.message.includes('encoding')) {
            errorMessage = `Encoding error in Python service: ${error.message}`;
          }
          
          updateLoadingStatus(`PDF analyzer failed: ${errorMessage}`);
          pythonServicePort = null;
          reject(new Error(errorMessage));
        });
        
        // Wait for server to be ready
        const checkReady = setInterval(() => {
          if (serverReady) {
            console.log('Python service is ready, starting proxy server...');
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
            console.error('Python service timeout after 20 seconds');
            console.error('Server ready status:', serverReady);
            console.error('Python process status:', pythonProcess ? 'running' : 'not running');
            console.error('Python process PID:', pythonProcess ? pythonProcess.pid : 'N/A');
            
            // Kill the process if it's still running
            if (pythonProcess && !pythonProcess.killed) {
              console.log('Killing unresponsive Python process...');
              pythonProcess.kill('SIGTERM');
            }
            
            pythonServicePort = null;
            reject(new Error('Python service startup timeout - service did not respond within 20 seconds'));
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