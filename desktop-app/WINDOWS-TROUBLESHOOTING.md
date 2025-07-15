# Windows Calculate-Price Error 500 Troubleshooting Guide

## Problem Description
The `calculate-price` endpoint returns a 500 error on Windows but works fine on macOS.

## Root Causes Identified

### 1. Platform-Specific Environment Variables
- **Issue**: The code was setting `OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES` on all platforms
- **Fix**: Now only sets this environment variable on macOS (`darwin` platform)

### 2. Python Executable Path Issues
- **Issue**: Windows executable (`pdf_analyzer.exe`) might not exist or have wrong permissions
- **Fix**: Added comprehensive path checking and Windows-specific access validation

### 3. Port Binding Issues
- **Issue**: Windows has different port binding behavior and firewall restrictions
- **Fix**: Added detailed error logging for port binding issues with Windows-specific error codes

### 4. Service Startup Timing
- **Issue**: Windows may need more time for services to start
- **Fix**: Increased timeout from 20s to 30s on Windows platform

## Changes Made to src/main.js

### 1. Environment Variables Fix (Lines 158-168)
```javascript
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
```

### 2. Enhanced Path Validation (Lines 136-154)
```javascript
console.log('Platform:', process.platform);
console.log('Python executable path:', pythonExePath);

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
```

### 3. Windows-Specific Error Handling (Lines 185-201)
```javascript
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
```

### 4. Port Binding Error Handling (Lines 447-459)
```javascript
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
```

### 5. Platform-Specific Timeout (Lines 237-239)
```javascript
// Platform-specific timeout - Windows may need more time
const timeout = process.platform === 'win32' ? 30000 : 20000;
```

## Debugging Steps

### 1. Check Console Logs
Look for these specific error messages in the console:
- `Python executable not found`
- `Permission denied - check antivirus or file permissions`
- `Port is already in use`
- `Address not available - check network configuration`

### 2. Verify Python Executable
1. Check if `python-service/pdf_analyzer.exe` exists
2. Verify file permissions
3. Check if antivirus is blocking the executable

### 3. Port Issues
1. Check if port 3001 is available: `netstat -an | findstr :3001`
2. Check Windows Firewall settings
3. Try running as Administrator

### 4. Antivirus Issues
- Add the application folder to antivirus exclusions
- Temporarily disable real-time protection for testing

## Testing the Fix

1. Build the application for Windows
2. Run the application and check console logs
3. Try uploading a PDF for price calculation
4. Monitor the detailed error messages if issues persist

## Additional Recommendations

1. **Antivirus Exclusions**: Add the entire application directory to antivirus exclusions
2. **Administrator Rights**: Try running the application as Administrator
3. **Windows Defender**: Check Windows Defender SmartScreen settings
4. **Network Configuration**: Ensure localhost (127.0.0.1) is not blocked
5. **Port Availability**: Use a different port if 3001 is consistently blocked

## Fallback Behavior

If the local Python service fails to start, the application will automatically fall back to using the online service at `cetakcerdas.com`, ensuring the application remains functional even if local processing fails.