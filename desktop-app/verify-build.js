const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔍 Verifying Cetak Cerdas Desktop Build...\n');

// Check if dist directory exists
if (!fs.existsSync('dist')) {
  console.error('❌ Dist directory not found. Please run build first.');
  process.exit(1);
}

// Function to calculate file hash
function calculateHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

// Function to get file size in MB
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

// Check build artifacts
const checks = [
  {
    name: 'Windows Installer',
    pattern: /Cetak Cerdas-Setup-.*\.exe$/,
    required: true
  },
  {
    name: 'Windows Unpacked',
    pattern: /win-unpacked/,
    required: false,
    isDirectory: true
  }
];

let allPassed = true;
const buildInfo = {
  timestamp: new Date().toISOString(),
  files: []
};

console.log('📋 Build Verification Report\n');
console.log('=' .repeat(50));

// Check each required file/directory
checks.forEach(check => {
  const distContents = fs.readdirSync('dist');
  const found = distContents.find(item => {
    if (check.isDirectory) {
      return fs.statSync(path.join('dist', item)).isDirectory() && check.pattern.test(item);
    } else {
      return check.pattern.test(item);
    }
  });

  if (found) {
    const fullPath = path.join('dist', found);
    const isDir = check.isDirectory || fs.statSync(fullPath).isDirectory();
    
    console.log(`✅ ${check.name}: ${found}`);
    
    if (!isDir) {
      const size = getFileSizeMB(fullPath);
      const hash = calculateHash(fullPath);
      console.log(`   Size: ${size} MB`);
      console.log(`   SHA256: ${hash.substring(0, 16)}...`);
      
      buildInfo.files.push({
        name: found,
        type: check.name,
        size: `${size} MB`,
        sha256: hash
      });
    }
  } else {
    if (check.required) {
      console.log(`❌ ${check.name}: NOT FOUND`);
      allPassed = false;
    } else {
      console.log(`⚠️  ${check.name}: NOT FOUND (optional)`);
    }
  }
});

console.log('\n' + '=' .repeat(50));

// Security checks
console.log('\n🛡️  Security Verification\n');

const installerFiles = fs.readdirSync('dist').filter(f => f.endsWith('.exe'));

if (installerFiles.length > 0) {
  const installerPath = path.join('dist', installerFiles[0]);
  
  // Check file size (should be reasonable)
  const sizeMB = parseFloat(getFileSizeMB(installerPath));
  if (sizeMB > 500) {
    console.log('⚠️  Large installer size detected:', sizeMB, 'MB');
    console.log('   Consider optimizing bundle size');
  } else {
    console.log('✅ Installer size is reasonable:', sizeMB, 'MB');
  }
  
  // Check if Python service is included
  if (fs.existsSync('python-service')) {
    console.log('✅ Python service directory found');
    
    const pythonExe = process.platform === 'win32' ? 'pdf_analyzer.exe' : 'pdf_analyzer';
    const pythonPath = path.join('python-service', pythonExe);
    
    if (fs.existsSync(pythonPath)) {
      console.log('✅ Python analyzer executable found');
      const pythonSize = getFileSizeMB(pythonPath);
      console.log(`   Python service size: ${pythonSize} MB`);
    } else {
      console.log('❌ Python analyzer executable not found');
      allPassed = false;
    }
  } else {
    console.log('⚠️  Python service directory not found');
  }
  
  // Check build configuration
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const buildConfig = packageJson.build;
    
    if (buildConfig && buildConfig.win) {
      console.log('✅ Windows build configuration found');
      
      if (buildConfig.win.publisherName) {
        console.log('✅ Publisher name set:', buildConfig.win.publisherName);
      } else {
        console.log('⚠️  Publisher name not set');
      }
      
      if (buildConfig.win.requestedExecutionLevel === 'asInvoker') {
        console.log('✅ Execution level set to asInvoker (good for security)');
      }
    }
  }
}

// Generate build report
console.log('\n📄 Generating build report...');
fs.writeFileSync('dist/build-report.json', JSON.stringify(buildInfo, null, 2));
console.log('✅ Build report saved to dist/build-report.json');

// Final status
console.log('\n' + '=' .repeat(50));
if (allPassed) {
  console.log('🎉 Build verification PASSED!');
  console.log('\n📋 Next Steps:');
  console.log('1. Test installer on clean Windows machine');
  console.log('2. Add dist folder to antivirus exclusions');
  console.log('3. Share README-ANTIVIRUS.md with users');
  console.log('4. Consider getting code signing certificate');
  
  // VirusTotal submission suggestion
  if (installerFiles.length > 0) {
    console.log('\n🔍 Optional: Submit to VirusTotal for analysis');
    console.log(`   File: ${installerFiles[0]}`);
    console.log('   URL: https://www.virustotal.com/gui/home/upload');
  }
} else {
  console.log('❌ Build verification FAILED!');
  console.log('Please fix the issues above and rebuild.');
  process.exit(1);
}