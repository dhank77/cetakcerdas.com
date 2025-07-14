const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Building Cetak Cerdas Desktop App (Simple Mode)...');

// Step 1: Clean previous builds
console.log('🧹 Cleaning previous builds...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Step 2: Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 3: Build frontend if needed
console.log('🏗️ Building frontend...');
try {
  execSync('npm run build:frontend', { stdio: 'inherit' });
} catch {
  console.log('⚠️ Frontend build failed, continuing with existing build...');
}

// Step 4: Build the application with simple configuration
console.log('🚀 Building Electron application...');
try {
  // Use electron-builder directly with environment variables to avoid VM
  execSync('npx electron-builder --win --x64 --publish=never', {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Disable problematic features
      CSC_IDENTITY_AUTO_DISCOVERY: 'false',
      ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES: 'true',
      ELECTRON_BUILDER_CACHE: 'false',
      USE_HARD_LINKS: 'false',
      // Force native build
      npm_config_target_platform: 'win32',
      npm_config_target_arch: 'x64',
      npm_config_disturl: 'https://electronjs.org/headers',
      npm_config_runtime: 'electron',
      npm_config_cache: '/tmp/.npm',
      npm_config_build_from_source: 'true'
    }
  });
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Output files are in the "dist" directory');
  console.log('');
  console.log('🛡️ IMPORTANT: If Windows Defender flags the installer:');
  console.log('   1. Add the "dist" folder to Windows Defender exclusions');
  console.log('   2. Share the README-ANTIVIRUS.md file with users');
  console.log('   3. Consider getting a code signing certificate for future releases');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.log('');
  console.log('💡 Troubleshooting tips:');
  console.log('   - Try running on a Windows machine directly');
  console.log('   - Use Docker for cross-platform builds');
  console.log('   - Check that all required files exist');
  console.log('   - Verify network connectivity');
  process.exit(1);
}