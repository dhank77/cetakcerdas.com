# DOCX Implementation with LibreOffice Headless and Mammoth

This document describes the implementation of DOCX file handling using LibreOffice headless for PDF conversion and Mammoth.js for preview functionality.

## Features Implemented

### 1. LibreOffice Headless PDF Conversion
- **Purpose**: Convert DOCX files to PDF for reliable printing
- **Command**: `soffice --headless --convert-to pdf --outdir <output_dir> <input_file>`
- **Fallback**: Uses `libreoffice-convert` library if command-line LibreOffice fails
- **Location**: `src/utils/docx-converter.js`

### 2. Mammoth.js Preview
- **Purpose**: Convert DOCX to HTML for in-app preview
- **Features**: 
  - Styled HTML preview with document-like appearance
  - Print and close buttons in preview window
  - Preserves basic formatting (headings, paragraphs, etc.)
- **Location**: `src/ipc/handlers.js` (preview-docx-file handler)

### 3. Smart Conversion Strategy
- **Primary**: LibreOffice headless command-line conversion
- **Secondary**: libreoffice-convert library
- **Fallback**: System default application (original behavior)

## Dependencies Added

```json
{
  "mammoth": "^1.6.0",
  "libreoffice-convert": "^1.6.0"
}
```

## API Endpoints

### IPC Handlers
1. **print-local-file-enhanced**: Enhanced printing with DOCX conversion
2. **preview-docx-file**: DOCX preview using Mammoth.js

### Frontend API
```typescript
interface LocalFileAPI {
  previewDocxFile(filePath: string): Promise<{ success: boolean; message?: string }>;
  printLocalFileEnhanced(options: { filePath: string; printSettings?: any }): Promise<{ success: boolean; message?: string; failureReason?: string }>;
}
```

## Usage

### In React Components
```typescript
// Preview DOCX
const result = await window.localFileAPI?.previewDocxFile(filePath);

// Print DOCX (with automatic conversion)
const printResult = await window.localFileAPI?.printLocalFileEnhanced({
  filePath: filePath,
  printSettings: settings
});
```

### LibreOffice Installation

For optimal functionality, LibreOffice should be installed:

**macOS**:
```bash
brew install --cask libreoffice
# or download from https://www.libreoffice.org/
```

**Windows**:
- Download and install from https://www.libreoffice.org/
- Ensure `soffice.exe` is in system PATH

**Linux**:
```bash
sudo apt-get install libreoffice
# or
sudo yum install libreoffice
```

## File Structure

```
src/
├── utils/
│   └── docx-converter.js          # DOCX conversion utilities
├── ipc/
│   └── handlers.js                 # IPC handlers with DOCX support
└── preload.js                      # Exposed APIs

resources/js/
├── types/
│   └── index.d.ts                  # TypeScript definitions
└── components/frontend/analysis/
    └── price-analysis.tsx          # UI with DOCX preview button
```

## Error Handling

1. **LibreOffice Not Found**: Falls back to system default application
2. **Conversion Failure**: Shows error message and falls back to system app
3. **File Not Found**: Displays appropriate error message
4. **Permission Issues**: Handles file access errors gracefully

## Performance Considerations

- **Temporary Files**: PDF conversions create temporary files that are cleaned up after 5 seconds
- **Conversion Timeout**: 30-second timeout for LibreOffice conversion
- **Memory Usage**: Mammoth.js processes DOCX in memory for preview

## Future Enhancements

1. **Batch Conversion**: Support for multiple DOCX files
2. **Conversion Settings**: Configurable PDF quality and options
3. **Progress Indicators**: Show conversion progress for large files
4. **Cache Management**: Cache converted PDFs for repeated printing
5. **Advanced Preview**: Support for images, tables, and complex formatting