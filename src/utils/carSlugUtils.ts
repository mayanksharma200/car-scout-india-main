// utils/carSlugUtils.js

/**
 * Generate a URL-friendly slug from a car object
 * @param {Object} car - Car object with brand, model, variant properties
 * @returns {string} - URL-friendly slug
 */
export const getCarSlugFromCar = (car) => {
  if (!car || !car.brand || !car.model) {
    console.warn('Invalid car object for slug generation:', car);
    return 'unknown-car';
  }

  const brand = car.brand || 'unknown';
  const model = car.model || 'unknown';
  const variant = car.variant || '';
  
  const slug = `${brand}-${model}${variant ? '-' + variant : ''}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  return slug;
};

/**
 * Create a slug from brand, model, and variant strings
 * @param {string} brand - Car brand
 * @param {string} model - Car model  
 * @param {string} variant - Car variant (optional)
 * @returns {string} - URL-friendly slug
 */
export const createCarSlug = (brand, model, variant = '') => {
  return getCarSlugFromCar({ brand, model, variant });
};

/**
 * Find a car by its slug from an array of cars
 * @param {Array} cars - Array of car objects
 * @param {string} slug - Slug to search for
 * @returns {Object|null} - Found car object or null
 */
export const findCarBySlug = (cars, slug) => {
  if (!Array.isArray(cars) || !slug) {
    return null;
  }

  // First try exact match
  let foundCar = cars.find(car => getCarSlugFromCar(car) === slug);
  
  if (foundCar) {
    return foundCar;
  }

  // If no exact match, try variations
  const slugParts = slug.split('-');
  if (slugParts.length >= 2) {
    const brand = slugParts[0];
    const model = slugParts[1];
    
    // Try to find by brand and model only
    foundCar = cars.find(car => {
      const carSlug = getCarSlugFromCar(car);
      return carSlug.startsWith(`${brand}-${model}`);
    });
    
    if (foundCar) {
      return foundCar;
    }
    
    // Try case-insensitive brand and model match
    foundCar = cars.find(car => 
      car.brand?.toLowerCase() === brand.toLowerCase() && 
      car.model?.toLowerCase() === model.toLowerCase()
    );
  }
  
  return foundCar || null;
};

/**
 * Parse a slug back into brand, model, and variant
 * @param {string} slug - Slug to parse
 * @returns {Object} - Object with brand, model, variant properties
 */
export const parseCarSlug = (slug) => {
  if (!slug) {
    return { brand: '', model: '', variant: '' };
  }

  const parts = slug.split('-');
  
  if (parts.length === 1) {
    return { brand: parts[0], model: '', variant: '' };
  } else if (parts.length === 2) {
    return { brand: parts[0], model: parts[1], variant: '' };
  } else {
    return { 
      brand: parts[0], 
      model: parts[1], 
      variant: parts.slice(2).join('-') 
    };
  }
};

/**
 * Validate if a slug is properly formatted
 * @param {string} slug - Slug to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidCarSlug = (slug) => {
  if (!slug || typeof slug !== 'string') {
    return false;
  }
  
  // Check if slug contains only allowed characters
  const validPattern = /^[a-z0-9-]+$/;
  if (!validPattern.test(slug)) {
    return false;
  }
  
  // Check if slug has at least brand and model
  const parts = slug.split('-');
  return parts.length >= 2 && parts.every(part => part.length > 0);
};

/**
 * Generate car search keywords from car object
 * @param {Object} car - Car object
 * @returns {Array} - Array of search keywords
 */
export const getCarSearchKeywords = (car) => {
  if (!car) return [];
  
  const keywords = [];
  
  if (car.brand) keywords.push(car.brand.toLowerCase());
  if (car.model) keywords.push(car.model.toLowerCase());
  if (car.variant) keywords.push(car.variant.toLowerCase());
  if (car.fuelType || car.fuel_type) keywords.push((car.fuelType || car.fuel_type).toLowerCase());
  if (car.bodyType || car.body_type) keywords.push((car.bodyType || car.body_type).toLowerCase());
  if (car.transmission) keywords.push(car.transmission.toLowerCase());
  
  // Add combined keywords
  if (car.brand && car.model) {
    keywords.push(`${car.brand} ${car.model}`.toLowerCase());
  }
  
  if (car.brand && car.model && car.variant) {
    keywords.push(`${car.brand} ${car.model} ${car.variant}`.toLowerCase());
  }
  
  return [...new Set(keywords)]; // Remove duplicates
};

/**
 * Redirect common slug variations to correct ones
 * @param {string} slug - Original slug
 * @returns {string} - Corrected slug or original if no redirect needed
 */
export const getRedirectedSlug = (slug) => {
  const redirectMap = {
    // MG redirects (since Hector is not available, redirect to Astor)
    'mg-hector': 'mg-astor-sharp',
    'mg-hector-super': 'mg-astor-super',
    'mg-hector-style': 'mg-astor-style',
    'mg-hector-smart': 'mg-astor-sharp',
    'mg-hector-sharp': 'mg-astor-sharp',
    
    // Common brand variations
    'maruti-suzuki': 'maruti',
    'marutisuzuki': 'maruti',
    
    // Model variations
    'innova-crysta': 'toyota-innova-crysta',
    'city': 'honda-city',
    'creta': 'hyundai-creta',
    'venue': 'hyundai-venue',
  };
  
  return redirectMap[slug?.toLowerCase()] || slug;
};

// Export all functions as default object for easier importing
export default {
  getCarSlugFromCar,
  createCarSlug,
  findCarBySlug,
  parseCarSlug,
  isValidCarSlug,
  getCarSearchKeywords,
  getRedirectedSlug
};