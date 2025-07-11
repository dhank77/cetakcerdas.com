const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building Desktop Application...');
console.log('='.repeat(50));

// Step 1: Build Laravel frontend
console.log('📦 Building Laravel frontend...');
try {
  process.chdir('..');
  
  // First try to install/update dependencies
  console.log('📦 Updating dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Then build
  console.log('🔨 Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend build completed');
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  console.log('💡 Trying alternative build approach...');
  
  try {
    // Try clearing cache and rebuilding
    execSync('rm -rf node_modules/.vite', { stdio: 'inherit' });
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend build completed with alternative approach');
  } catch (retryError) {
    console.error('❌ Alternative build also failed:', retryError.message);
    console.log('');
    console.log('🔧 Manual fix required:');
    console.log('1. Check Node.js version (should be 18+)');
    console.log('2. Try: rm -rf node_modules && npm install');
    console.log('3. Try: npm run build');
    process.exit(1);
  }
}

// Step 2: Copy frontend build to desktop app
console.log('📁 Copying frontend assets...');
const frontendBuildPath = path.join(__dirname, 'frontend-build');
const laravelPublicBuild = path.join(__dirname, '../public/build');

// Create frontend-build directory
if (!fs.existsSync(frontendBuildPath)) {
  fs.mkdirSync(frontendBuildPath, { recursive: true });
}

// Copy built assets
try {
  if (fs.existsSync(laravelPublicBuild)) {
    execSync(`cp -r "${laravelPublicBuild}"/* "${frontendBuildPath}"/`, { stdio: 'inherit' });
  }
  
  // Create a simple index.html that loads the Laravel app
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Print Management System</title>
    <meta name="csrf-token" content="">
    <script>
        window.APP_CONFIG = {
            SERVER_URL: 'https://cetakcerdas.com',
            LOCAL_MODE: true,
            PYTHON_SERVICE_URL: 'http://127.0.0.1:9006'
        };
    </script>
</head>
<body>
    <div id="app">
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
                <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <h2>Loading Print Management System...</h2>
                <p>Connecting to server...</p>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    </div>
    <script>
        setTimeout(() => {
            window.location.href = window.APP_CONFIG.SERVER_URL;
        }, 2000);
    </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(frontendBuildPath, 'index.html'), indexHtml);
  console.log('✅ Frontend assets copied');
} catch (error) {
  console.error('❌ Failed to copy frontend assets:', error.message);
  process.exit(1);
}

// Step 3: Build Python executable
console.log('🐍 Building Python executable...');
const pythonServicePath = path.join(__dirname, 'python-service');

// Create python-service directory
if (!fs.existsSync(pythonServicePath)) {
  fs.mkdirSync(pythonServicePath, { recursive: true });
}

try {
  // Change to FastAPI directory and build executable
  const fastapiPath = path.resolve(__dirname, '../fastapi/pdf_analyzer');
  console.log(`🔍 Looking for FastAPI directory at: ${fastapiPath}`);
  
  if (!fs.existsSync(fastapiPath)) {
    throw new Error(`FastAPI directory not found: ${fastapiPath}`);
  }
  
  console.log(`📁 Changing to FastAPI directory: ${fastapiPath}`);
  process.chdir(fastapiPath);
  
  // Install requirements if needed
  console.log('📦 Installing Python requirements...');
  execSync('pip install -r requirements.txt', { stdio: 'inherit' });
  
  // Build executable
  console.log('🔨 Building Python executable...');
  execSync('python build_executable.py', { stdio: 'inherit' });
  
  // Copy executable to desktop app
  const platform = process.platform;
  const exeName = platform === 'win32' ? 'pdf_analyzer.exe' : 'pdf_analyzer';
  const executableSource = path.join(process.cwd(), 'dist', exeName);
  const executableDest = path.join(pythonServicePath, exeName);
  
  if (fs.existsSync(executableSource)) {
    fs.copyFileSync(executableSource, executableDest);
    
    // Make executable on Unix systems
    if (platform !== 'win32') {
      execSync(`chmod +x "${executableDest}"`);
    }
    
    console.log('✅ Python executable built and copied');
  } else {
    throw new Error('Python executable not found after build');
  }
  
} catch (error) {
  console.error('❌ Python executable build failed:', error.message);
  process.exit(1);
}

// Step 4: Create application icons
console.log('🎨 Creating application icons...');
const assetsPath = path.join(__dirname, 'assets');

if (!fs.existsSync(assetsPath)) {
  fs.mkdirSync(assetsPath, { recursive: true });
}

// Copy logo from Laravel public directory if it exists
const laravelLogo = path.join(__dirname, '../public/logo.svg');
if (fs.existsSync(laravelLogo)) {
  fs.copyFileSync(laravelLogo, path.join(assetsPath, 'icon.svg'));
}

// Create simple icon files
const createSimpleIcon = (filename, size = '32x32') => {
  const iconPath = path.join(assetsPath, filename);
  if (!fs.existsSync(iconPath)) {
    // Create a simple text-based icon placeholder
    const iconContent = `<!-- Simple ${size} icon placeholder -->
<svg width="${size.split('x')[0]}" height="${size.split('x')[1]}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#4F46E5"/>
  <text x="50%" y="50%" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dy=".3em">P</text>
</svg>`;
    fs.writeFileSync(iconPath, iconContent);
  }
};

createSimpleIcon('icon.svg', '256x256');
createSimpleIcon('icon.png', '256x256');
createSimpleIcon('icon.ico', '256x256');
createSimpleIcon('icon.icns', '256x256');

console.log('✅ Application icons created');

// Step 5: Return to desktop app directory
process.chdir(__dirname);

console.log('\n🎉 Build preparation completed!');
console.log('📋 Next steps:');
console.log('   1. Update SERVER_URL in the configuration files');
console.log('   2. Run: npm install');
console.log('   3. Run: npm run dist');
console.log('\n📁 Files created:');
console.log('   - frontend-build/ (Laravel frontend assets)');
console.log('   - python-service/ (Python PDF analyzer executable)');
console.log('   - assets/ (Application icons)');