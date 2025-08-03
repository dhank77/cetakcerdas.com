# Windows Troubleshooting Guide

This guide helps resolve common issues when running the Cetak Cerdas Desktop App on Windows.

## Common Issues

### 1. Python Service Not Starting

**Symptoms:**
- Error: "Python was not found"
- Exit code 9009
- Application fails to load

**Solutions:**

#### Option 1: Use the Compiled Executable (Recommended)
The app includes a pre-compiled `pdf_analyzer.exe` that doesn't require Python installation:

1. Ensure `pdf_analyzer.exe` exists in the `python-service` folder
2. The app will automatically use this executable
3. No additional Python installation required

#### Option 2: Install Python (Alternative)
If you prefer to use Python directly:

1. Download Python 3.8+ from [python.org](https://python.org)
2. During installation, check "Add Python to PATH"
3. Restart your computer
4. Verify installation: Open Command Prompt and run `python --version`

### 2. Encoding Issues

**Symptoms:**
- Garbled text in console output
- UnicodeDecodeError or UnicodeEncodeError
- Application crashes with encoding-related errors
- Error: `'charmap' codec can't encode character '\U0001f680'`
- CP1252 encoding errors on Windows

**Root Cause:**
Windows defaults to CP1252 encoding which cannot handle Unicode characters like emojis. The Python executable may not inherit UTF-8 environment properly.

**Solutions Applied:**

1. **Enhanced UTF-8 Wrapper Scripts:**
   - `run_python_utf8.bat` - Batch file wrapper
   - `run_python_utf8.ps1` - PowerShell wrapper

2. **Comprehensive Environment Variables:**
   ```batch
   chcp 65001
   set PYTHONIOENCODING=utf-8:replace
   set PYTHONUTF8=1
   set PYTHONLEGACYWINDOWSSTDIO=0
   set LC_ALL=C.UTF-8
   set LANG=C.UTF-8
   set PYTHONCOERCECLOCALE=0
   set PYTHONMALLOC=malloc
   set PYTHONFAULTHANDLER=1
   set PYTHONDEFAULTENCODING=utf-8
   ```

3. **Node.js Environment Setup:**
   - Automatic UTF-8 environment injection for Windows
   - Graceful encoding error handling with `:replace` suffix
   - Forced UTF-8 locale settings

### 3. Path Resolution Issues (NEW)

**Symptoms:**
- "Failed to fetch" errors when calculating price
- Loading window not appearing
- File not found errors for assets

**Root Cause:**
Windows uses different path separators (`\`) compared to Unix systems (`/`). ES6 modules with `import.meta.url` can cause path resolution issues.

**Solutions Applied:**

1. **Enhanced Path Normalization:**
   - Added `path.normalize()` for all file paths
   - Cross-platform compatible path resolution
   - Proper handling of Windows path separators

2. **Improved fileURLToPath Usage:**
   ```javascript
   // Before (problematic on Windows)
   const __dirname = path.dirname(new URL(import.meta.url).pathname);
   
   // After (Windows compatible)
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);
   ```

3. **Helper Functions for Path Resolution:**
   ```javascript
   function getAssetPath(relativePath) {
     return path.normalize(path.join(__dirname, relativePath));
   }
   
   function getFrontendPath(relativePath) {
     return path.normalize(path.join(__dirname, '../../frontend-build', relativePath));
   }
   ```

### 4. Platform-Specific Environment Variables
- **Issue**: The code was setting `OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES` on all platforms
- **Fix**: Now only sets this environment variable on macOS (`darwin` platform)

### 5. Python Executable Path Issues
- **Issue**: Windows executable (`pdf_analyzer.exe`) might not exist or have wrong permissions
- **Fix**: Added comprehensive path checking and Windows-specific access validation

### 6. Port Binding Issues
- **Issue**: Windows has different port binding behavior and firewall restrictions
- **Fix**: Added detailed error logging for port binding issues with Windows-specific error codes

### 7. Service Startup Timing
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

## Advanced Troubleshooting

### Encoding Error Debugging

If you encounter `UnicodeEncodeError` or `'charmap' codec` errors:

1. **Check Console Output:**
   Look for error messages like:
   ```
   UnicodeEncodeError: 'charmap' codec can't encode character '\U0001f680'
   File "encodings\cp1252.py", line 19, in encode
   ```

2. **Verify Environment Variables:**
   ```cmd
   echo %PYTHONIOENCODING%
   echo %PYTHONUTF8%
   echo %LC_ALL%
   ```
   Should output:
   ```
   utf-8:replace
   1
   C.UTF-8
   ```

3. **Test UTF-8 Support:**
   ```cmd
   cd python-service
   run_python_utf8.bat --version
   ```

4. **Manual Encoding Test:**
   ```cmd
   chcp 65001
   python -c "print('🚀 UTF-8 test')"
   ```

### Enable Debug Mode

1. Open Command Prompt in the application directory
2. Run with debug flags:
   ```cmd
   npm start -- --enable-logging --log-level=0
   ```

## Additional Recommendations

1. **Antivirus Exclusions**: Add the entire application directory to antivirus exclusions
2. **Administrator Rights**: Try running the application as Administrator
3. **Windows Defender**: Check Windows Defender SmartScreen settings
4. **Network Configuration**: Ensure localhost (127.0.0.1) is not blocked
5. **Port Availability**: Use a different port if 3001 is consistently blocked

## Fallback Behavior

If the local Python service fails to start, the application will automatically fall back to using the online service at `cetakcerdas.com`, ensuring the application remains functional even if local processing fails.