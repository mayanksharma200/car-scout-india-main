import dotenv from 'dotenv';

dotenv.config();

class IMAGINOnlyService {
  constructor() {
    this.baseURL = 'https://cdn.imagin.studio/getimage';
    this.apiURL = 'https://api.imagin.studio/getimage';
    this.customerKey = process.env.IMAGIN_CUSTOMER_KEY;
    this.tailoringKey = process.env.IMAGIN_TAILORING_KEY;
    
    if (!this.customerKey) {
      throw new Error('IMAGIN_CUSTOMER_KEY not found in environment variables');
    }
    if (!this.tailoringKey) {
      throw new Error('IMAGIN_TAILORING_KEY not found in environment variables');
    }
  }

  /**
   * Generate car image URL using IMAGIN.studio API - ONLY IMAGIN, NO FALLBACKS
   */
  generateCarImageURL(carData, options = {}) {
    const {
      angle = '21',
      fileType = 'png',
      width = '800',
      zoomType = 'fullscreen',
      safeMode = 'true',
      randomPaint = 'true',
      modelYear = '2024'
    } = options;

    const params = new URLSearchParams({
      customer: this.customerKey,
      make: this.normalizeBrand(carData.brand),
      modelFamily: this.normalizeModel(carData.model),
      modelVariant: this.normalizeBodyType(carData.body_type),
      angle,
      fileType,
      width
    });

    // Add optional premium parameters
    if (zoomType) params.set('zoomType', zoomType);
    if (safeMode) params.set('safeMode', safeMode);
    if (randomPaint) params.set('randomPaint', randomPaint);
    if (modelYear) params.set('modelYear', modelYear);

    const imaginURL = `${this.baseURL}?${params.toString()}`;
    
    // Return both the original IMAGIN URL and the proxied URL for frontend
    return {
      original: imaginURL,
      proxied: `http://localhost:3001/api/imagin-proxy?${new URLSearchParams({ url: imaginURL }).toString()}`
    };
  }

  /**
   * Generate simple IMAGIN URL for backend validation
   */
  generateSimpleURL(carData, options = {}) {
    const {
      angle = '21',
      fileType = 'png',
      width = '800',
      zoomType = 'fullscreen',
      safeMode = 'true',
      randomPaint = 'true',
      modelYear = '2024'
    } = options;

    const params = new URLSearchParams({
      customer: this.customerKey,
      make: this.normalizeBrand(carData.brand),
      modelFamily: this.normalizeModel(carData.model),
      modelVariant: this.normalizeBodyType(carData.body_type),
      angle,
      fileType,
      width
    });

    // Add optional premium parameters
    if (zoomType) params.set('zoomType', zoomType);
    if (safeMode) params.set('safeMode', safeMode);
    if (randomPaint) params.set('randomPaint', randomPaint);
    if (modelYear) params.set('modelYear', modelYear);

    return `${this.baseURL}?${params.toString()}`;
  }

  /**
   * Validate if IMAGIN image exists - returns true only if IMAGIN works
   */
  async validateIMAGINImage(imageURL) {
    try {
      const response = await fetch(imageURL, { 
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${this.tailoringKey}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error('IMAGIN validation error:', error);
      return false;
    }
  }

  /**
   * Get IMAGIN images ONLY - returns null if IMAGIN doesn't work
   */
  async getIMAGINImages(carData, angles = ['21', '01', '05', '09']) {
    const results = [];
    
    for (const angle of angles) {
      // Use simple URL for validation
      const simpleURL = this.generateSimpleURL(carData, { angle });
      const isValid = await this.validateIMAGINImage(simpleURL);
      
      if (isValid) {
        // Generate both URLs for storage
        const urls = this.generateCarImageURL(carData, { angle });
        results.push({
          angle,
          url: urls.proxied, // Use proxied URL for frontend
          originalUrl: urls.original, // Keep original for reference
          source: 'imagin',
          valid: true
        });
      }
    }

    // Only return if we have at least one valid IMAGIN image
    return results.length > 0 ? results : null;
  }

  // Helper methods to normalize car data for IMAGIN
  normalizeBrand(brand) {
    const brandMap = {
      'mg': 'mg',
      'morris garages': 'mg',
      'tata': 'tata',
      'maruti suzuki': 'maruti',
      'maruti': 'maruti',
      'suzuki': 'maruti',
      'hyundai': 'hyundai',
      'honda': 'honda',
      'toyota': 'toyota',
      'mahindra': 'mahindra',
      'ford': 'ford',
      'volkswagen': 'volkswagen',
      'vw': 'volkswagen',
      'skoda': 'skoda',
      'renault': 'renault',
      'nissan': 'nissan',
      'kia': 'kia',
      'audi': 'audi',
      'bmw': 'bmw',
      'mercedes-benz': 'mercedes-benz',
      'mercedes': 'mercedes-benz'
    };

    const normalizedBrand = brand?.toLowerCase();
    return brandMap[normalizedBrand] || normalizedBrand || 'unknown';
  }

  normalizeModel(model) {
    // Handle special cases that match IMAGIN's naming
    const modelMap = {
      'c-class': 'c-class',
      'c class': 'c-class', 
      'a3': 'a3',
      'a4': 'a4',
      'x3': 'x3',
      '3 series': '3-series',
      'hector': 'hector'
    };

    const cleanModel = model?.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim() || 'unknown';
    
    return modelMap[cleanModel] || cleanModel;
  }

  normalizeBodyType(bodyType) {
    const bodyTypeMap = {
      'sedan': 'sedan',
      'hatchback': 'hatchback',
      'suv': 'suv',
      'muv': 'mpv',
      'mpv': 'mpv',
      'crossover': 'suv',
      'coupe': 'coupe',
      'convertible': 'convertible',
      'estate': 'estate',
      'wagon': 'estate',
      'pickup': 'pickup',
      'van': 'mpv'
    };

    const normalizedType = bodyType?.toLowerCase();
    return bodyTypeMap[normalizedType] || 'suv';
  }

  normalizeFuelType(fuelType) {
    const fuelMap = {
      'petrol': 'petrol',
      'gasoline': 'petrol',
      'diesel': 'diesel',
      'electric': 'electric',
      'ev': 'electric',
      'hybrid': 'phev',
      'phev': 'phev',
      'cng': 'cng',
      'lpg': 'lpg'
    };

    const normalizedFuel = fuelType?.toLowerCase();
    return fuelMap[normalizedFuel] || 'petrol';
  }

  normalizeTrim(variant) {
    return variant?.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim() || '';
  }
}

export default IMAGINOnlyService;