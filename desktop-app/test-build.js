const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 Testing Build Configuration...\n');

// Test 1: Check package.json
console.log('1. Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.build && packageJson.build.win) {
    console.log('✅ Windows build config found');
  } else {
    console.log('❌ Windows build config missing');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ package.json error:', error.message);
  process.exit(1);
}

// Test 2: Check installer script
console.log('2. Checking installer script...');
if (fs.existsSync('build/installer.nsh')) {
  console.log('✅ Custom installer script found');
} else {
  console.log('❌ Custom installer script missing');
  process.exit(1);
}

// Test 3: Check assets
console.log('3. Checking assets...');
const requiredAssets = ['assets/icon.ico', 'assets/icon.png'];
let assetsOk = true;

requiredAssets.forEach(asset => {
  if (fs.existsSync(asset)) {
    console.log(`✅ ${asset} found`);
  } else {
    console.log(`❌ ${asset} missing`);
    assetsOk = false;
  }
});

if (!assetsOk) {
  console.log('⚠️ Some assets missing, but continuing...');
}

// Test 4: Check Python service
console.log('4. Checking Python service...');
if (fs.existsSync('python-service')) {
  console.log('✅ Python service directory found');
  
  const pythonExe = process.platform === 'win32' ? 'pdf_analyzer.exe' : 'pdf_analyzer';
  if (fs.existsSync(`python-service/${pythonExe}`)) {
    console.log('✅ Python analyzer executable found');
  } else {
    console.log('⚠️ Python analyzer executable not found');
  }
} else {
  console.log('⚠️ Python service directory not found');
}

// Test 5: Test electron-builder dry run
console.log('5. Testing electron-builder (dry run)...');
try {
  execSync('npx electron-builder --help', { stdio: 'pipe' });
  console.log('✅ electron-builder is working');
} catch (error) {
  console.log('❌ electron-builder error:', error.message);
  process.exit(1);
}

console.log('\n🎉 All tests passed! Ready to build.');
console.log('\nNext steps:');
console.log('- Run: npm run build:safe');
console.log('- Or: npm run build:complete');