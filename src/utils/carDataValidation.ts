/**
 * Car Data Validation Utilities
 *
 * Centralized validation functions to ensure data integrity when importing cars
 * from various sources (CSV, Excel, SQL dumps, JSON, etc.)
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Check if a string contains a URL
 */
export const containsURL = (str: string | undefined | null): boolean => {
  if (!str) return false;

  // More specific URL patterns to avoid false positives
  const urlPatterns = [
    /https?:\/\//i,           // http:// or https://
    /www\./i,                 // www.
    /carwale\.com/i,          // carwale.com
    /\.(com|in|org|net|io|co)\s*\//i,  // domain extensions followed by /
    /^https?:/i,              // Starts with http: or https:
  ];

  const hasURL = urlPatterns.some(pattern => pattern.test(str));

  // Debug logging to see what's being detected
  if (hasURL) {
    console.log(`URL detected in: "${str}"`);
  }

  return hasURL;
};

/**
 * List of invalid brand/model names that should be rejected
 */
export const INVALID_CAR_NAMES = [
  '1',
  '292',
  'Basic',
  'Source URL',
  'naming-source_url',
  'naming-make',
  'naming-model',
  'Make',
  'Model',
  'Version',
  'Variant'
];

/**
 * Validate a brand name
 */
export const validateBrand = (brand: string | undefined | null): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!brand || brand.trim() === '') {
    errors.push('Brand is required');
    return { isValid: false, errors, warnings };
  }

  const trimmedBrand = brand.trim();

  // Check for URLs
  if (containsURL(trimmedBrand)) {
    errors.push(`Brand contains URL: "${trimmedBrand}". Please use brand name only (e.g., "BMW", "Tata", "Maruti Suzuki")`);
  }

  // Check for invalid names
  if (INVALID_CAR_NAMES.includes(trimmedBrand)) {
    errors.push(`Invalid brand name: "${trimmedBrand}"`);
  }

  // Check if brand is too short (might be a typo or abbreviation)
  if (trimmedBrand.length < 2) {
    warnings.push(`Brand name is very short: "${trimmedBrand}". Please verify.`);
  }

  // Check if brand is all numbers
  if (/^\d+$/.test(trimmedBrand)) {
    errors.push(`Brand cannot be only numbers: "${trimmedBrand}"`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate a model name
 */
export const validateModel = (model: string | undefined | null): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!model || model.trim() === '') {
    errors.push('Model is required');
    return { isValid: false, errors, warnings };
  }

  const trimmedModel = model.trim();

  // Check for URLs
  if (containsURL(trimmedModel)) {
    errors.push(`Model contains URL: "${trimmedModel}". Please use model name only (e.g., "3 Series", "Nexon", "Swift")`);
  }

  // Check for invalid names
  if (INVALID_CAR_NAMES.includes(trimmedModel)) {
    errors.push(`Invalid model name: "${trimmedModel}"`);
  }

  // Check if model is too short (might be a typo)
  if (trimmedModel.length < 1) {
    warnings.push(`Model name is very short: "${trimmedModel}". Please verify.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate a variant name
 */
export const validateVariant = (variant: string | undefined | null): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Variant is optional, so empty is okay
  if (!variant || variant.trim() === '') {
    return { isValid: true, errors, warnings };
  }

  const trimmedVariant = variant.trim();

  // Check for URLs
  if (containsURL(trimmedVariant)) {
    errors.push(`Variant contains URL: "${trimmedVariant}". Please use variant name only (e.g., "Sport", "Luxury", "Base")`);
  }

  // Check for invalid names
  if (INVALID_CAR_NAMES.includes(trimmedVariant)) {
    errors.push(`Invalid variant name: "${trimmedVariant}"`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate complete car data
 */
export interface CarDataInput {
  brand?: string | null;
  model?: string | null;
  variant?: string | null;
  price_min?: number | null;
  price_max?: number | null;
}

export const validateCarData = (
  car: CarDataInput,
  index?: number
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const prefix = index !== undefined ? `Car ${index + 1}: ` : '';

  // Validate brand
  const brandValidation = validateBrand(car.brand);
  errors.push(...brandValidation.errors.map(e => prefix + e));
  warnings.push(...brandValidation.warnings.map(w => prefix + w));

  // Validate model
  const modelValidation = validateModel(car.model);
  errors.push(...modelValidation.errors.map(e => prefix + e));
  warnings.push(...modelValidation.warnings.map(w => prefix + w));

  // Validate variant (optional)
  if (car.variant) {
    const variantValidation = validateVariant(car.variant);
    errors.push(...variantValidation.errors.map(e => prefix + e));
    warnings.push(...variantValidation.warnings.map(w => prefix + w));
  }

  // Validate prices
  if (car.price_min !== undefined && car.price_min !== null) {
    if (typeof car.price_min !== 'number' || car.price_min < 0) {
      errors.push(`${prefix}Invalid price_min: ${car.price_min}`);
    }
    if (car.price_min > 100000000) {
      warnings.push(`${prefix}Price seems very high: ₹${car.price_min.toLocaleString()}. Please verify.`);
    }
    if (car.price_min < 100000) {
      warnings.push(`${prefix}Price seems very low: ₹${car.price_min.toLocaleString()}. Please verify.`);
    }
  }

  if (car.price_max !== undefined && car.price_max !== null) {
    if (typeof car.price_max !== 'number' || car.price_max < 0) {
      errors.push(`${prefix}Invalid price_max: ${car.price_max}`);
    }
    if (car.price_min && car.price_max && car.price_max < car.price_min) {
      errors.push(`${prefix}price_max (₹${car.price_max.toLocaleString()}) is less than price_min (₹${car.price_min.toLocaleString()})`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate an array of car data
 */
export const validateCarDataBatch = (cars: CarDataInput[]): ValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  if (!Array.isArray(cars)) {
    allErrors.push('Input must be an array');
    return { isValid: false, errors: allErrors, warnings: allWarnings };
  }

  if (cars.length === 0) {
    allErrors.push('Array is empty - no cars to import');
    return { isValid: false, errors: allErrors, warnings: allWarnings };
  }

  cars.forEach((car, index) => {
    const validation = validateCarData(car, index);
    allErrors.push(...validation.errors);
    allWarnings.push(...validation.warnings);
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
};

/**
 * Check if a car entry should be skipped during import
 */
export const shouldSkipCarEntry = (
  brand: string | undefined | null,
  model: string | undefined | null,
  notes?: string | undefined | null
): { skip: boolean; reason?: string } => {
  // Skip if no brand or model
  if (!brand || !model) {
    return { skip: true, reason: 'Missing brand or model' };
  }

  const trimmedBrand = brand.trim();
  const trimmedModel = model.trim();

  // Skip discontinued cars
  if (notes?.toLowerCase().includes('discontinued')) {
    return { skip: true, reason: 'Car is discontinued' };
  }

  // Skip header rows
  if (trimmedBrand === 'Make' || trimmedModel === 'Model') {
    return { skip: true, reason: 'Header row' };
  }

  // Skip if brand or model contains URLs
  if (containsURL(trimmedBrand) || containsURL(trimmedModel)) {
    return { skip: true, reason: 'Brand or model contains URL' };
  }

  // Skip invalid names
  if (INVALID_CAR_NAMES.includes(trimmedBrand) || INVALID_CAR_NAMES.includes(trimmedModel)) {
    return { skip: true, reason: 'Invalid brand or model name' };
  }

  // Skip database info rows
  if (
    trimmedBrand.includes('INDIA CAR DATABASE') ||
    trimmedBrand.includes('Compiled in Excel') ||
    trimmedBrand.includes('This is a SAMPLE')
  ) {
    return { skip: true, reason: 'Database information row' };
  }

  return { skip: false };
};
