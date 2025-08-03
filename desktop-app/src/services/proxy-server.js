import express from 'express';
import cors from 'cors';
import multer from 'multer';
import FormData from 'form-data';
import { CONFIG } from '../config.js';
import { fetchWithRetry } from '../utils/network.js';
import { pythonServicePort } from './python-service.js';

// Global server reference
export let localServer;

// Start proxy server that forwards requests to Python server
export function startProxyServer() {
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    
    // Health check endpoint
    app.get('/', (req, res) => {
      res.json({ status: 'online', mode: 'server_proxy', pythonServicePort: pythonServicePort });
    });
    
    // PDF analysis endpoint - proxy to Python server or fallback to online service
    app.post('/analyze-document', multer().single('file'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const colorThreshold = parseFloat(req.query.color_threshold) || 10.0;
        const photoThreshold = parseFloat(req.query.photo_threshold) || 30.0;
        
        // Check if Python service is available
        if (pythonServicePort) {
          try {
            // Forward request to Python server
            const form = new FormData();
            form.append('file', req.file.buffer, {
              filename: req.file.originalname,
              contentType: req.file.mimetype
            });
            
            const response = await fetchWithRetry(`http://127.0.0.1:${pythonServicePort}/analyze-document?color_threshold=${colorThreshold}&photo_threshold=${photoThreshold}`, {
              method: 'POST',
              body: form,
              headers: form.getHeaders()
            });
            
            if (!response.ok) {
              throw new Error(`Python server error: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            res.json(result);
            return;
          } catch (pythonError) {
            console.error('Python service error, falling back to online service:', pythonError);
            // No fallback to online service - application works offline only
            throw new Error('Python service not available and no online fallback configured for offline mode');
          }
        }
        
        // No fallback to online service - application works offline only
        throw new Error('Python service not available and no online fallback configured for offline mode');
        
      } catch (error) {
        console.error('PDF analysis error:', error);
        res.status(500).json({ error: error.message });
      }
    });
    
    // Calculate price endpoint - includes analysis and price calculation
    app.post('/calculate-price', multer().single('file'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Default price settings (same as Laravel controller)
        let priceSettingPhoto = 2000;
        let priceSettingColor = 1000;
        let priceSettingBw = 500;
        let colorThreshold = 20;
        let photoThreshold = 30;
        
        // Get slug from request body or query parameters
        const slug = req.body.slug || req.query.slug;
        
        // Try to fetch user settings if slug is provided and online
        if (slug) {
          try {
            const settingsResponse = await fetchWithRetry(`${CONFIG.SERVER_URL}/api/user-settings/${slug}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              timeout: 5000 // 5 second timeout
            });
            
            if (settingsResponse.ok) {
              const settingsData = await settingsResponse.json();
              if (settingsData.setting) {
                priceSettingColor = settingsData.setting.color_price || priceSettingColor;
                priceSettingPhoto = settingsData.setting.photo_price > 0 ? settingsData.setting.photo_price : priceSettingColor;
                priceSettingBw = settingsData.setting.bw_price || priceSettingBw;
                console.log(`Using custom settings for user: ${slug}`);
              }
            }
          } catch (settingsError) {
            console.warn('Failed to fetch user settings, using defaults:', settingsError.message);
          }
        }
        
        console.log(`Price settings - Color: ${priceSettingColor}, BW: ${priceSettingBw}, Photo: ${priceSettingPhoto}`);
        
        // Check if Python service is available
        if (pythonServicePort) {
          try {
            // Forward request to Python server for analysis
            const form = new FormData();
            form.append('file', req.file.buffer, {
              filename: req.file.originalname,
              contentType: req.file.mimetype
            });
            
            const response = await fetchWithRetry(`http://127.0.0.1:${pythonServicePort}/analyze-document?color_threshold=${colorThreshold}&photo_threshold=${photoThreshold}`, {
              method: 'POST',
              body: form,
              headers: form.getHeaders()
            });
            
            if (response.ok) {
              const analysisResult = await response.json();
              
              // Calculate prices based on analysis result
              const priceColor = (analysisResult.color_pages || 0) * priceSettingColor;
              const priceBw = (analysisResult.bw_pages || 0) * priceSettingBw;
              const pricePhoto = (analysisResult.photo_pages || 0) * priceSettingPhoto;
              const totalPrice = priceColor + priceBw + pricePhoto;
              
              // Return response in same format as Laravel controller
              res.json({
                price_color: priceColor,
                price_bw: priceBw,
                price_photo: pricePhoto,
                total_price: totalPrice,
                file_url: null, // No file storage in desktop app
                file_name: req.file.originalname,
                file_type: req.file.mimetype,
                analysis_mode: 'local_desktop',
                service_available: true,
                pengaturan: {
                  threshold_warna: colorThreshold.toString(),
                  threshold_foto: photoThreshold.toString(),
                  price_setting_color: priceSettingColor,
                  price_setting_bw: priceSettingBw,
                  price_setting_photo: priceSettingPhoto,
                },
                ...analysisResult,
              });
              return;
            }
          } catch (pythonError) {
            console.error('Python service error for price calculation:', pythonError);
            // Continue to investigate the root cause
          }
        }
        
        throw new Error('Python service not available');
        
      } catch (error) {
        console.error('Calculate price error:', error);
        res.status(500).json({
          error: error.message,
          service_available: false
        });
      }
    });
    
    app.use('*', (req, res) => {
      res.status(503).json({ error: 'Service not available' });
    });
    
    localServer = app.listen(CONFIG.LOCAL_PORT, '127.0.0.1', () => {
      console.log(`Local proxy server running on port ${CONFIG.LOCAL_PORT}`);
      resolve();
    });
    
    localServer.on('error', (error) => {
      console.error('Local proxy server error:', error);
      reject(error);
    });
  });
}