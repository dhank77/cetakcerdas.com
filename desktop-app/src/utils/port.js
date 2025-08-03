import net from 'net';
import { spawn } from 'child_process';

// Function to kill process using a specific port (Windows/macOS/Linux)
export function killProcessOnPort(port) {
  return new Promise((resolve) => {
    let command, args;
    
    if (process.platform === 'win32') {
      // Windows: netstat + taskkill
      command = 'cmd';
      args = ['/c', `for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port}') do taskkill /f /pid %a`];
    } else {
      // macOS/Linux: lsof + kill
      command = 'sh';
      args = ['-c', `lsof -ti:${port} | xargs kill -9 2>/dev/null || true`];
    }
    
    const killProcess = spawn(command, args, { stdio: 'ignore' });
    
    killProcess.on('close', () => {
      console.log(`Attempted to kill process on port ${port}`);
      resolve();
    });
    
    killProcess.on('error', () => {
      console.log(`No process found on port ${port} or failed to kill`);
      resolve();
    });
    
    // Timeout after 3 seconds
    setTimeout(() => {
      killProcess.kill();
      resolve();
    }, 3000);
  });
}

// Function to check if a port is available
export function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    let resolved = false;
    
    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        tester.close(() => {});
        resolve(false);
      }
    }, 2000);
    
    tester.once('error', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        tester.close(() => {});
        resolve(false);
      }
    });
    
    tester.once('listening', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        tester.close(() => {
          resolve(true);
        });
      }
    });
    
    try {
      tester.listen(port, '127.0.0.1');
    } catch {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(false);
      }
    }
  });
}

// Function to find an available port starting from basePort with cleanup
export async function findAvailablePort(basePort, maxAttempts = 50) {
  console.log(`Searching for available port starting from ${basePort}...`);
  
  // First, try to clean up the base port if it's stuck
  try {
    await killProcessOnPort(basePort);
    // Wait a moment for cleanup to take effect
    await new Promise(resolve => setTimeout(resolve, 1000));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.warn('Port cleanup failed, continuing with search...');
  }
  
  for (let i = 0; i < maxAttempts; i++) {
    const port = basePort + i;
    console.log(`Checking port ${port}...`);
    
    try {
      const available = await isPortAvailable(port);
      if (available) {
        console.log(`Found available port: ${port}`);
        return port;
      }
      console.log(`Port ${port} is in use, trying next...`);
    } catch (error) {
      console.warn(`Error checking port ${port}:`, error.message);
      continue;
    }
  }
  
  // Try alternative port ranges if initial range fails
   console.log('Initial range exhausted, trying alternative ranges...');
   
   const alternativeRanges = [
     { start: 9100, count: 20 },
     { start: 8080, count: 20 },
     { start: 3000, count: 20 },
     { start: 5000, count: 20 }
   ];
   
   for (const range of alternativeRanges) {
     console.log(`Trying alternative range: ${range.start}-${range.start + range.count - 1}`);
     
     for (let i = 0; i < range.count; i++) {
       const port = range.start + i;
       
       try {
         const available = await isPortAvailable(port);
         if (available) {
           console.log(`Found available port in alternative range: ${port}`);
           return port;
         }
       } catch (error) {
         console.warn(`Error checking alternative port ${port}:`, error.message);
         continue;
       }
     }
   }
   
   // Last resort: try to force cleanup and retry base port
   console.log('All ranges exhausted, attempting force cleanup and retry...');
   try {
     await killProcessOnPort(basePort);
     await killProcessOnPort(basePort + 1);
     await killProcessOnPort(basePort + 2);
     
     // Wait longer for cleanup
     await new Promise(resolve => setTimeout(resolve, 3000));
     
     // Try base port again
     const available = await isPortAvailable(basePort);
     if (available) {
       console.log(`Force cleanup successful, using base port: ${basePort}`);
       return basePort;
     }
   } catch (error) {
     console.warn('Force cleanup failed:', error.message);
   }
   
   throw new Error(`Could not find available port after checking ${maxAttempts} ports in primary range and ${alternativeRanges.reduce((sum, range) => sum + range.count, 0)} ports in alternative ranges. All cleanup attempts failed.`);
}