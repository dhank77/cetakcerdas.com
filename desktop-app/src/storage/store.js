import Store from 'electron-store';
import fs from 'fs';

// Analysis cache store
export const analysisStore = new Store({
  name: 'analysis-cache',
  defaults: {
    analyzedFiles: [],
    printSettings: {
      paperSize: 'A4',
      orientation: 'portrait',
      quality: 'normal',
      copies: 1,
      duplex: false
    }
  }
});

// Generate file hash for caching
export function generateFileHash(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return `${stats.size}-${stats.mtime.getTime()}`;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return Date.now().toString();
  }
}

// Save analysis result to store
export function saveAnalysisResult(fileData) {
  try {
    const analyzedFiles = analysisStore.get('analyzedFiles', []);
    
    const newEntry = {
      id: fileData.id || Date.now().toString(),
      filePath: fileData.filePath,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize,
      lastModified: fileData.lastModified,
      analysisResult: fileData.analysisResult,
      analyzedAt: Date.now(),
      fileHash: fileData.fileHash || generateFileHash(fileData.filePath)
    };
    
    analyzedFiles.push(newEntry);
    
    // Keep only last 100 entries
    if (analyzedFiles.length > 100) {
      analyzedFiles.splice(0, analyzedFiles.length - 100);
    }
    
    analysisStore.set('analyzedFiles', analyzedFiles);
    
    return { success: true, id: newEntry.id };
  } catch (error) {
    console.error('Error saving analysis result:', error);
    return { success: false, error: error.message };
  }
}

// Get analysis history
export function getAnalysisHistory() {
  try {
    return analysisStore.get('analyzedFiles', []);
  } catch (error) {
    console.error('Error getting analysis history:', error);
    return [];
  }
}

// Get print settings
export function getPrintSettings() {
  try {
    return analysisStore.get('printSettings', {
      paperSize: 'A4',
      orientation: 'portrait',
      quality: 'normal',
      copies: 1,
      duplex: false
    });
  } catch (error) {
    console.error('Error getting print settings:', error);
    return {
      paperSize: 'A4',
      orientation: 'portrait',
      quality: 'normal',
      copies: 1,
      duplex: false
    };
  }
}

// Save print settings
export function savePrintSettings(settings) {
  try {
    analysisStore.set('printSettings', settings);
    return { success: true };
  } catch (error) {
    console.error('Error saving print settings:', error);
    return { success: false, error: error.message };
  }
}

// Clear analysis cache
export function clearAnalysisCache() {
  try {
    analysisStore.set('analyzedFiles', []);
    console.log('✅ Analysis cache cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing analysis cache:', error);
    return false;
  }
}

// Office application preference store
export const officeStore = new Store({
  name: 'office-preferences',
  defaults: {
    officeApp: {
      type: 'auto', // 'auto', 'libreoffice', 'msoffice', 'wps'
      lastUpdated: Date.now()
    }
  }
});

// Save office application preference
export function saveOfficePreference(preference) {
  try {
    const officePreference = {
      type: preference.type || 'auto',
      lastUpdated: Date.now()
    };
    
    officeStore.set('officeApp', officePreference);
    console.log('✅ Office preference saved:', officePreference);
    return true;
  } catch (error) {
    console.error('❌ Error saving office preference:', error);
    return false;
  }
}

// Get office application preference
export function getOfficePreference() {
  try {
    const preference = officeStore.get('officeApp', { type: 'auto', lastUpdated: Date.now() });
    console.log('✅ Office preference retrieved:', preference);
    return preference;
  } catch (error) {
    console.error('❌ Error getting office preference:', error);
    return { type: 'auto', lastUpdated: Date.now() };
  }
}