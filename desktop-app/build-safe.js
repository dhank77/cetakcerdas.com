const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Step 3: Create app manifest for Windows
console.log('📋 Creating Windows app manifest...');
const manifestContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
  <assemblyIdentity
    version="1.0.0.0"
    processorArchitecture="*"
    name="CetakCerdas.Desktop"
    type="win32"
  />
  <description>Cetak Cerdas - Print Management System</description>
  <dependency>
    <dependentAssembly>
      <assemblyIdentity
        type="win32"
        name="Microsoft.Windows.Common-Controls"
        version="6.0.0.0"
        processorArchitecture="*"
        publicKeyToken="6595b64144ccf1df"
        language="*"
      />
    </dependentAssembly>
  </dependency>
  <trustInfo xmlns="urn:schemas-microsoft-com:asm.v2">
    <security>
      <requestedPrivileges xmlns="urn:schemas-microsoft-com:asm.v3">
        <requestedExecutionLevel level="asInvoker" uiAccess="false" />
      </requestedPrivileges>
    </security>
  </trustInfo>
  <compatibility xmlns="urn:schemas-microsoft-com:compatibility.v1">
    <application>
      <supportedOS Id="{8e0f7a12-bfb3-4fe8-b9a5-48fd50a15a9a}" />
      <supportedOS Id="{1f676c76-80e1-4239-95bb-83d0f6d0da78}" />
      <supportedOS Id="{4a2f28e3-53b9-4441-ba9c-d69d4a4a6e38}" />
      <supportedOS Id="{35138b9a-5d96-4fbd-8e2d-a2440225f93a}" />
      <supportedOS Id="{e2011457-1546-43c5-a5fe-008deee3d3f0}" />
    </application>
  </compatibility>
</assembly>`;

fs.writeFileSync('build/app.manifest', manifestContent);

// Step 4: Create version info resource
console.log('📝 Creating version info...');
const versionInfo = `1 VERSIONINFO
FILEVERSION 1,0,0,0
PRODUCTVERSION 1,0,0,0
FILEFLAGSMASK 0x3fL
FILEFLAGS 0x0L
FILEOS 0x40004L
FILETYPE 0x1L
FILESUBTYPE 0x0L
BEGIN
    BLOCK "StringFileInfo"
    BEGIN
        BLOCK "040904b0"
        BEGIN
            VALUE "CompanyName", "Cetak Cerdas"
            VALUE "FileDescription", "Print Management System with PDF Analysis"
            VALUE "FileVersion", "1.0.0.0"
            VALUE "InternalName", "cetakcerdas"
            VALUE "LegalCopyright", "Copyright © 2025 Cetak Cerdas"
            VALUE "OriginalFilename", "Cetak Cerdas.exe"
            VALUE "ProductName", "Cetak Cerdas"
            VALUE "ProductVersion", "1.0.0.0"
        END
    END
    BLOCK "VarFileInfo"
    BEGIN
        VALUE "Translation", 0x409, 1200
    END
END`;

fs.writeFileSync('build/version.rc', versionInfo);

// Step 5: Build frontend if needed
console.log('🏗️ Building frontend...');
try {
  execSync('npm run build:frontend', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️ Frontend build failed, continuing with existing build...');
}

// Step 6: Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 7: Build the application
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