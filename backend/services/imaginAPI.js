import dotenv from 'dotenv';

dotenv.config();

class IMAGINAPIService {
  constructor() {
    this.baseURL = 'https://s3-eu-west-1.amazonaws.com/images.wheel.ag/s3/c';
    this.customerKey = process.env.IMAGIN_CUSTOMER_KEY;
    this.tailoringKey = process.env.IMAGIN_TAILORING_KEY;
    
    if (!this.customerKey) {
      console.warn('IMAGIN_CUSTOMER_KEY not found in environment variables');
    }
    if (!this.tailoringKey) {
      console.warn('IMAGIN_TAILORING_KEY not found in environment variables');
    }
  }

  /**
   * Generate car image URL using IMAGIN.studio API
   * @param {Object} carData - Car data object
   * @param {Object} options - Image options
   * @returns {string} - Image URL
   */
  generateCarImageURL(carData, options = {}) {
    const {
      angle = '21',
      fileType = 'png',
      width = '800',
      zoomType = 'fullscreen',
      safeMode = 'true',
      randomPaint = 'true',
      countryCode = 'IN'
    } = options;

    // Map car data to IMAGIN data points
    const params = new URLSearchParams({
      customer: this.customerKey,
      tailoring: this.tailoringKey,
      make: this.normalizeBrand(carData.brand),
      modelFamily: this.normalizeModel(carData.model),
      modelVariant: this.normalizeBodyType(carData.body_type),
      powerTrain: this.normalizeFuelType(carData.fuel_type),
      angle,
      fileType,
      width,
      zoomType,
      safeMode,
      randomPaint,
      countryCode
    });

    // Add optional parameters
    if (carData.variant && carData.variant !== carData.model) {
      params.set('trim', this.normalizeTrim(carData.variant));
    }

    if (carData.model_year) {
      params.set('modelYear', carData.model_year.toString());
    }

    return `${this.baseURL}?${params.toString()}`;
  }

  /**
   * Generate multiple angles for a car
   * @param {Object} carData - Car data object
   * @param {Array} angles - Array of angles to generate
   * @returns {Array} - Array of image URLs
   */
  generateMultipleAngles(carData, angles = ['21', '01', '05', '09']) {
    return angles.map(angle => ({
      angle,
      url: this.generateCarImageURL(carData, { angle })
    }));
  }

  /**
   * Validate if image exists
   * @param {string} imageURL - Image URL to validate
   * @returns {Promise<boolean>} - Whether image exists
   */
  async validateImage(imageURL) {
    try {
      const response = await fetch(imageURL, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Error validating image:', error);
      return false;
    }
  }

  /**
   * Get best available image for a car
   * @param {Object} carData - Car data object
   * @returns {Promise<Object>} - Best image data
   */
  async getBestCarImage(carData) {
    const angles = ['21', '01', '05', '09'];
    
    for (const angle of angles) {
      const imageURL = this.generateCarImageURL(carData, { angle });
      const isValid = await this.validateImage(imageURL);
      
      if (isValid) {
        return {
          url: imageURL,
          angle,
          valid: true
        };
      }
    }

    // Return fallback if no images found
    return {
      url: this.generateCarImageURL(carData, { randomPaint: 'true' }),
      angle: '21',
      valid: false,
      fallback: true
    };
  }

  // Helper methods to normalize car data
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
    // Remove special characters and normalize model names
    return model?.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim() || 'unknown';
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
    // Clean up trim/variant names
    return variant?.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim() || '';
  }
}

export default IMAGINAPIService;