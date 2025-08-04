import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import libre from 'libreoffice-convert';
import { promisify } from 'util';

const libreConvert = promisify(libre.convert);

/**
 * Check if LibreOffice is installed and available
 * @returns {boolean} True if LibreOffice is available
 */
export function isLibreOfficeAvailable() {
  try {
    // Try different common LibreOffice executable names
    const commands = ['soffice', 'libreoffice', '/Applications/LibreOffice.app/Contents/MacOS/soffice'];
    
    for (const cmd of commands) {
      try {
        execSync(`${cmd} --version`, { stdio: 'ignore', timeout: 5000 });
        console.log(`✅ LibreOffice found: ${cmd}`);
        return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Continue to next command
      }
    }
    
    console.log('❌ LibreOffice not found in system PATH');
    return false;
  } catch (error) {
    console.error('Error checking LibreOffice availability:', error);
    return false;
  }
}

/**
 * Get LibreOffice executable path
 * @returns {string|null} Path to LibreOffice executable or null if not found
 */
export function getLibreOfficeExecutable() {
  const commands = [
    'soffice',
    'libreoffice', 
    '/Applications/LibreOffice.app/Contents/MacOS/soffice',
    '/usr/bin/soffice',
    '/usr/local/bin/soffice'
  ];
  
  for (const cmd of commands) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore', timeout: 5000 });
      return cmd;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Continue to next command
    }
  }
  
  return null;
}

/**
 * Convert DOCX to PDF using LibreOffice headless
 * @param {string} inputPath - Path to input DOCX file
 * @param {string} outputDir - Directory to save PDF output
 * @returns {Promise<string>} Path to converted PDF file
 */
export async function convertDocxToPdfWithLibreOffice(inputPath, outputDir) {
  return new Promise((resolve, reject) => {
    const libreOfficeCmd = getLibreOfficeExecutable();
    
    if (!libreOfficeCmd) {
      reject(new Error('LibreOffice not found. Please install LibreOffice to convert DOCX files.'));
      return;
    }
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // LibreOffice headless conversion command
    const args = [
      '--headless',
      '--convert-to', 'pdf',
      '--outdir', outputDir,
      inputPath
    ];
    
    console.log(`🔄 Converting DOCX to PDF: ${libreOfficeCmd} ${args.join(' ')}`);
    
    const process = spawn(libreOfficeCmd, args, {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        // Generate expected PDF filename
        const inputFilename = path.basename(inputPath, '.docx');
        const pdfPath = path.join(outputDir, `${inputFilename}.pdf`);
        
        if (fs.existsSync(pdfPath)) {
          console.log(`✅ DOCX converted to PDF: ${pdfPath}`);
          resolve(pdfPath);
        } else {
          reject(new Error(`PDF file not created: ${pdfPath}`));
        }
      } else {
        console.error(`❌ LibreOffice conversion failed with code ${code}`);
        console.error('STDOUT:', stdout);
        console.error('STDERR:', stderr);
        reject(new Error(`LibreOffice conversion failed: ${stderr || stdout || 'Unknown error'}`));
      }
    });
    
    process.on('error', (error) => {
      console.error('❌ LibreOffice process error:', error);
      reject(error);
    });
    
    // Set timeout for conversion (30 seconds)
    setTimeout(() => {
      if (!process.killed) {
        process.kill();
        reject(new Error('LibreOffice conversion timeout'));
      }
    }, 30000);
  });
}

/**
 * Convert DOCX to PDF using libreoffice-convert library (alternative method)
 * @param {string} inputPath - Path to input DOCX file
 * @param {string} outputPath - Path for output PDF file
 * @returns {Promise<string>} Path to converted PDF file
 */
export async function convertDocxToPdfWithLibrary(inputPath, outputPath) {
  try {
    console.log(`🔄 Converting DOCX to PDF using library: ${inputPath} -> ${outputPath}`);
    
    // Read DOCX file
    const docxBuffer = fs.readFileSync(inputPath);
    
    // Convert to PDF
    const pdfBuffer = await libreConvert(docxBuffer, '.pdf', undefined);
    
    // Write PDF file
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log(`✅ DOCX converted to PDF: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Library conversion failed:', error);
    throw error;
  }
}

/**
 * Convert DOCX to HTML for preview using mammoth
 * @param {string} inputPath - Path to input DOCX file
 * @returns {Promise<string>} HTML content
 */
export async function convertDocxToHtml(inputPath) {
  try {
    console.log(`🔄 Converting DOCX to HTML for preview: ${inputPath}`);
    
    const result = await mammoth.convertToHtml({ path: inputPath });
    
    if (result.messages.length > 0) {
      console.warn('⚠️ Mammoth conversion warnings:', result.messages);
    }
    
    console.log(`✅ DOCX converted to HTML for preview`);
    return result.value;
  } catch (error) {
    console.error('❌ Mammoth conversion failed:', error);
    throw error;
  }
}

/**
 * Convert DOCX to plain text using mammoth
 * @param {string} inputPath - Path to input DOCX file
 * @returns {Promise<string>} Plain text content
 */
export async function convertDocxToText(inputPath) {
  try {
    console.log(`🔄 Converting DOCX to text: ${inputPath}`);
    
    const result = await mammoth.extractRawText({ path: inputPath });
    
    console.log(`✅ DOCX converted to text`);
    return result.value;
  } catch (error) {
    console.error('❌ Mammoth text extraction failed:', error);
    throw error;
  }
}

/**
 * Smart DOCX to PDF conversion with fallback methods
 * @param {string} inputPath - Path to input DOCX file
 * @param {string} outputDir - Directory to save PDF output
 * @returns {Promise<string>} Path to converted PDF file
 */
export async function smartDocxToPdfConversion(inputPath, outputDir) {
  const inputFilename = path.basename(inputPath, '.docx');
  const outputPath = path.join(outputDir, `${inputFilename}.pdf`);
  
  // Method 1: Try LibreOffice headless (most reliable)
  if (isLibreOfficeAvailable()) {
    try {
      return await convertDocxToPdfWithLibreOffice(inputPath, outputDir);
    } catch (error) {
      console.warn('⚠️ LibreOffice headless conversion failed, trying library method:', error.message);
    }
  }
  
  // Method 2: Try libreoffice-convert library
  try {
    return await convertDocxToPdfWithLibrary(inputPath, outputPath);
  } catch (error) {
    console.warn('⚠️ Library conversion failed:', error.message);
  }
  
  // If all methods fail, throw error
  throw new Error('All DOCX to PDF conversion methods failed. Please install LibreOffice or ensure the DOCX file is valid.');
}