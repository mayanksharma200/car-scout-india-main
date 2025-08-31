import dotenv from 'dotenv';
import IMAGINAPIService from './imaginAPI.js';

dotenv.config();

class CarImageService {
  constructor() {
    this.imaginAPI = new IMAGINAPIService();
    this.fallbackSources = [
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&q=80', // Generic car 1
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80', // Generic car 2
      'https://images.unsplash.com/photo-1546768292-fb12f6c92568?w=800&q=80', // Generic car 3
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80', // Generic car 4
    ];
  }

  /**
   * Get car image with multiple fallback strategies
   */
  async getCarImage(carData, options = {}) {
    const strategies = [
      () => this.tryIMAGINImage(carData, options),
      () => this.tryUnsplashCarImage(carData),
      () => this.getGenericCarImage(carData),
      () => this.getPlaceholderImage()
    ];

    for (const strategy of strategies) {
      try {
        const result = await strategy();
        if (result && result.url) {
          return result;
        }
      } catch (error) {
        console.log(`Strategy failed: ${error.message}`);
        continue;
      }
    }

    // Final fallback
    return {
      url: '/placeholder.svg',
      source: 'placeholder',
      valid: false
    };
  }

  async tryIMAGINImage(carData, options = {}) {
    try {
      const imageURL = this.imaginAPI.generateCarImageURL(carData, options);
      const isValid = await this.imaginAPI.validateImage(imageURL);
      
      if (isValid) {
        return {
          url: imageURL,
          source: 'imagin',
          valid: true,
          angle: options.angle || '21'
        };
      }
      return null;
    } catch (error) {
      console.log('IMAGIN failed:', error.message);
      return null;
    }
  }

  async tryUnsplashCarImage(carData) {
    try {
      // Create search query based on car data
      const searchTerms = [
        carData.brand,
        carData.model,
        carData.body_type || 'car'
      ].filter(Boolean).join(' ');

      // Use Unsplash API (if you have a key) or curated car images
      const carImageMap = this.getCarImageMap();
      const brand = carData.brand?.toLowerCase();
      const model = carData.model?.toLowerCase();
      
      // Try brand-specific images first
      if (carImageMap[brand] && carImageMap[brand][model]) {
        return {
          url: carImageMap[brand][model],
          source: 'curated',
          valid: true
        };
      }
      
      // Try brand generic images
      if (carImageMap[brand] && carImageMap[brand]['generic']) {
        return {
          url: carImageMap[brand]['generic'],
          source: 'brand_generic',
          valid: true
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  getCarImageMap() {
    return {
      'audi': {
        'generic': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
        'a4': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
        'q7': 'https://images.unsplash.com/photo-1563720223520-3ad3b5cd0aa7?w=800&q=80'
      },
      'bmw': {
        'generic': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
        '3 series': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
        'x3': 'https://images.unsplash.com/photo-1569829356019-ef7ec9153e5d?w=800&q=80'
      },
      'mercedes-benz': {
        'generic': 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80',
        'c-class': 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80',
        'e-class': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80'
      },
      'mercedes': {
        'generic': 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80'
      },
      'toyota': {
        'generic': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
        'camry': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
        'corolla': 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80'
      },
      'honda': {
        'generic': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
        'civic': 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&q=80',
        'accord': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80'
      },
      'hyundai': {
        'generic': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80',
        'elantra': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80',
        'tucson': 'https://images.unsplash.com/photo-1619976215249-2e1c1b20c898?w=800&q=80'
      },
      'mg': {
        'generic': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
        'hector': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
        'zs': 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=800&q=80'
      },
      'maruti': {
        'generic': 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80',
        'swift': 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80',
        'baleno': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
        'dzire': 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80'
      },
      'maruti suzuki': {
        'generic': 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80'
      }
    };
  }

  getGenericCarImage(carData) {
    const bodyType = carData.body_type?.toLowerCase();
    const bodyTypeImages = {
      'suv': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
      'sedan': 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&q=80',
      'hatchback': 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80',
      'coupe': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
      'convertible': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80'
    };

    return {
      url: bodyTypeImages[bodyType] || this.fallbackSources[0],
      source: 'generic_body_type',
      valid: true
    };
  }

  getPlaceholderImage() {
    return {
      url: '/placeholder.svg',
      source: 'placeholder',
      valid: false
    };
  }

  /**
   * Get multiple images for a car (different angles/views)
   */
  async getCarImages(carData, count = 4) {
    const images = [];
    
    // Try to get primary image
    const primaryImage = await this.getCarImage(carData);
    images.push(primaryImage);

    // If IMAGIN worked, try different angles
    if (primaryImage.source === 'imagin') {
      const angles = ['01', '05', '09'];
      for (const angle of angles.slice(0, count - 1)) {
        try {
          const angleImage = await this.tryIMAGINImage(carData, { angle });
          if (angleImage) {
            images.push(angleImage);
          } else {
            images.push(this.getGenericCarImage(carData));
          }
        } catch {
          images.push(this.getGenericCarImage(carData));
        }
      }
    } else {
      // Use different generic images
      for (let i = 1; i < count && i < this.fallbackSources.length; i++) {
        images.push({
          url: this.fallbackSources[i],
          source: 'fallback',
          valid: true
        });
      }
    }

    return images.slice(0, count);
  }
}

export default CarImageService;