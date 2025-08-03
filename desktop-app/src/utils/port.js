import net from 'net';

// Function to check if a port is available
export function isPortAvailable(port) {
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
export async function findAvailablePort(basePort, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = basePort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`Could not find available port after ${maxAttempts} attempts`);
}