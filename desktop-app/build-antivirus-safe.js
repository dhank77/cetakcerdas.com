import { build } from 'electron-builder';
import fs from 'fs';
import path from 'path';

// Configuration untuk mengurangi false positive
const antivirusSafeConfig = {
  appId: 'com.cetakcerdas.desktop',
  productName: 'Cetak Cerdas',
  directories: {
    output: 'dist-safe'
  },
  files: [
    'src/**/*',
    'frontend-build/**/*',
    'python-service/**/*',
    'package.json'
  ],
  extraResources: [
    {
      from: 'python-service',
      to: 'python-service',
      filter: ['**/*']
    }
  ],
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ],
    icon: 'assets/icon.ico',
    // Tambahkan metadata untuk mengurangi false positive
    legalTrademarks: 'Cetak Cerdas',
    companyName: 'Cetak Cerdas',
    fileDescription: 'Cetak Cerdas Desktop Application',
    productName: 'Cetak Cerdas',
    // Signing configuration (jika ada certificate)
    certificateFile: process.env.CERTIFICATE_FILE,
    certificatePassword: process.env.CERTIFICATE_PASSWORD,
    // NSIS configuration untuk mengurangi deteksi
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: true,
      shortcutName: 'Cetak Cerdas',
      // Tambahkan metadata NSIS
      displayLanguageSelector: false,
      installerLanguages: ['en_US'],
      // Custom NSIS script untuk mengurangi false positive
      include: 'build/installer-safe.nsh'
    }
  },
  mac: {
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      }
    ],
    icon: 'assets/icon.icns',
    category: 'public.app-category.productivity',
    // macOS specific untuk mengurangi false positive
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist'
  },
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      }
    ],
    icon: 'assets/icon.png',
    category: 'Office'
  },
  // Compression settings untuk mengurangi false positive
  compression: 'normal', // Jangan gunakan maximum compression
  // Asar configuration
  asar: {
    unpack: '**/*.{node,dll,exe,dylib,so}'
  },
  // Publish configuration
  publish: null, // Disable auto-publish
  // Build configuration untuk mengurangi false positive
  buildDependenciesFromSource: false,
  nodeGypRebuild: false,
  npmRebuild: false
};

// Function untuk membuat NSIS script yang aman
function createSafeNSISScript() {
  const nsisScript = `
; Custom NSIS script untuk mengurangi false positive
!define PRODUCT_NAME "Cetak Cerdas"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "Cetak Cerdas Team"
!define PRODUCT_WEB_SITE "https://cetakcerdas.com"
!define PRODUCT_DIR_REGKEY "Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\cetak-cerdas.exe"
!define PRODUCT_UNINST_KEY "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"

; Tambahkan informasi untuk mengurangi false positive
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "Cetak Cerdas Desktop"
VIAddVersionKey "CompanyName" "Cetak Cerdas Team"
VIAddVersionKey "LegalCopyright" "© 2025 Cetak Cerdas Team"
VIAddVersionKey "FileDescription" "Desktop application for document printing analysis"
VIAddVersionKey "FileVersion" "1.0.0.0"
VIAddVersionKey "ProductVersion" "1.0.0.0"
VIAddVersionKey "InternalName" "cetak-cerdas"
VIAddVersionKey "OriginalFilename" "cetak-cerdas.exe"
VIAddVersionKey "LegalTrademarks" "Cetak Cerdas"

; Request admin privileges dengan penjelasan
RequestExecutionLevel admin

; Custom pages untuk menjelaskan aplikasi
!include "MUI2.nsh"
!define MUI_WELCOMEPAGE_TITLE "Cetak Cerdas Desktop Setup"
!define MUI_WELCOMEPAGE_TEXT "This application helps you analyze PDF documents for printing cost calculation. It's a legitimate business tool developed by Cetak Cerdas team."

; Tambahkan informasi antivirus
!define MUI_FINISHPAGE_SHOWREADME
!define MUI_FINISHPAGE_SHOWREADME_TEXT "View Antivirus Information"
!define MUI_FINISHPAGE_SHOWREADME_FUNCTION ShowAntivirusInfo

Function ShowAntivirusInfo
  ExecShell "open" "https://cetakcerdas.com/antivirus-info"
FunctionEnd
`;

  const buildDir = path.join(__dirname, 'build');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  fs.writeFileSync(path.join(buildDir, 'installer-safe.nsh'), nsisScript);
}

// Function untuk membuat entitlements macOS
function createMacEntitlements() {
  const entitlements = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.disable-library-validation</key>
  <true/>
  <key>com.apple.security.network.client</key>
  <true/>
  <key>com.apple.security.files.user-selected.read-write</key>
  <true/>
</dict>
</plist>`;

  const buildDir = path.join(__dirname, 'build');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  fs.writeFileSync(path.join(buildDir, 'entitlements.mac.plist'), entitlements);
}

// Main build function
async function buildAntivirusSafe() {
  console.log('🛡️  Building antivirus-safe version...');
  
  try {
    // Create necessary files
    createSafeNSISScript();
    createMacEntitlements();
    
    // Build the application
    await build({
      config: antivirusSafeConfig,
      publish: 'never'
    });
    
    console.log('✅ Antivirus-safe build completed successfully!');
    console.log('📁 Output directory: dist-safe/');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Test the application on clean systems');
    console.log('2. Submit to VirusTotal for analysis');
    console.log('3. Report false positives using FALSE-POSITIVE-REPORT.md');
    console.log('4. Consider getting code signing certificate');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildAntivirusSafe();
}

export { buildAntivirusSafe, antivirusSafeConfig };