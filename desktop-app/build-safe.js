const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Building Cetak Cerdas Desktop App with Anti-Virus Optimizations...');

// Step 1: Clean previous builds
console.log('🧹 Cleaning previous builds...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Step 2: Ensure build directory exists
console.log('📁 Creating build directory...');
if (!fs.existsSync('build')) {
  fs.mkdirSync('build', { recursive: true });
}

// Step 3: Verify build configuration
console.log('📋 Verifying build configuration...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!packageJson.build || !packageJson.build.win) {
  console.error('❌ Windows build configuration not found in package.json');
  process.exit(1);
}
console.log('✅ Build configuration verified');

// Step 4: Build frontend if needed
console.log('🏗️ Building frontend...');
try {
  execSync('npm run build:frontend', { stdio: 'inherit' });
} catch {
  console.log('⚠️ Frontend build failed, continuing with existing build...');
}

// Step 5: Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 6: Build the application
console.log('🚀 Building Electron application...');
try {
  // Build for Windows with optimizations
  execSync('npx electron-builder --win --x64 --publish=never', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      CSC_IDENTITY_AUTO_DISCOVERY: 'false', // Disable code signing auto-discovery
      ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES: 'true'
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
  console.log('   - Make sure all dependencies are installed');
  console.log('   - Check that Python service files exist');
  console.log('   - Verify icon files are present');
  process.exit(1);
}