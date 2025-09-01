// IMAGIN.studio API utility functions

interface CarImageParams {
  make: string;
  modelFamily: string;
  modelVariant?: string;
  paintId: string;
  paintDescription: string;
  angle?: string;
  width?: string;
  fileType?: string;
}

// API Configuration
const IMAGIN_CONFIG = {
  baseUrl: "https://cdn.imagin.studio/getimage",
  customer: "sg-zorbitads",
  authToken: "i%uPLIZFivd4", // URL encoded token
};

/**
 * Normalize model names for IMAGIN.studio API compatibility
 */
const normalizeModelName = (make: string, model: string): string => {
  const makeLC = make.toLowerCase();
  const modelLC = model.toLowerCase();
  
  // Handle special model name cases
  const modelMappings: Record<string, string> = {
    // Mahindra specific mappings
    'mahindra-scorpio n': 'scorpio-n',
    'mahindra-scorpio-n': 'scorpio-n', 
    'mahindra-scorpion': 'scorpio',
    'mahindra-xuv 700': 'xuv700',
    'mahindra-xuv 300': 'xuv300',
    
    // Handle spaces and special characters
    'tata-nexon ev': 'nexon',
    'hyundai-i20 n line': 'i20',
    'maruti suzuki-swift': 'swift',
  };
  
  const carKey = `${makeLC}-${modelLC}`;
  if (modelMappings[carKey]) {
    return modelMappings[carKey];
  }
  
  // Default normalization: remove spaces, special chars, keep hyphens
  return modelLC.replace(/[^\w\-]/g, '').replace(/\s+/g, '');
};

/**
 * Normalize make names for IMAGIN.studio API compatibility  
 */
const normalizeMakeName = (make: string): string => {
  const makeMappings: Record<string, string> = {
    'maruti suzuki': 'maruti',
    'tata motors': 'tata', 
    'mahindra & mahindra': 'mahindra',
    'force motors': 'force',
  };
  
  const makeLC = make.toLowerCase();
  return makeMappings[makeLC] || makeLC.replace(/\s+/g, '').replace(/[^\w]/g, '');
};

/**
 * Generate a single car image URL with IMAGIN.studio API
 */
export const generateImageUrl = (params: CarImageParams): string => {
  const queryParams = new URLSearchParams({
    customer: IMAGIN_CONFIG.customer,
    make: normalizeMakeName(params.make),
    modelFamily: normalizeModelName(params.make, params.modelFamily),
    modelVariant: params.modelVariant || 'suv',
    angle: params.angle || '01',
    fileType: params.fileType || 'png',
    width: params.width || '800',
    paintId: params.paintId,
    paintDescription: params.paintDescription,
  });

  return `${IMAGIN_CONFIG.baseUrl}?${queryParams.toString()}`;
};

// Enhanced model variant mapping with car-specific rules
const getModelVariant = (bodyType?: string, make?: string, model?: string): string => {
  const makeLC = make?.toLowerCase();
  const modelLC = model?.toLowerCase();
  
  // Special cases for specific car models
  const specialCases: Record<string, string> = {
    // Mahindra specific
    'mahindra-thar': 'offroad',
    'mahindra-scorpio': 'suv',
    'mahindra-scorpion': 'suv', 
    'mahindra-scorpio-n': 'suv',
    'mahindra-xuv700': 'suv',
    'mahindra-xuv300': 'suv',
    
    // Toyota specific
    'toyota-fortuner': 'suv',
    'toyota-innova': 'mpv',
    
    // Maruti specific  
    'maruti-swift': 'hatchback',
    'maruti-baleno': 'hatchback',
    'maruti-brezza': 'suv',
    
    // Hyundai specific
    'hyundai-creta': 'suv',
    'hyundai-venue': 'suv',
    'hyundai-i20': 'hatchback',
    
    // Tata specific
    'tata-nexon': 'suv',
    'tata-harrier': 'suv',
    'tata-safari': 'suv',
  };
  
  const carKey = `${makeLC}-${modelLC}`;
  if (specialCases[carKey]) {
    return specialCases[carKey];
  }
  
  // Default body type mapping
  if (!bodyType) return 'suv';
  
  const bodyTypeMap: Record<string, string> = {
    'hatchback': 'hatchback',
    'sedan': 'sedan', 
    'suv': 'suv',
    'crossover': 'suv',
    'compact suv': 'suv',
    'mid-size suv': 'suv',
    'wagon': 'wagon',
    'coupe': 'coupe',
    'convertible': 'convertible',
    'mpv': 'mpv',
    'muv': 'mpv',
  };
  
  return bodyTypeMap[bodyType.toLowerCase()] || 'suv';
};

/**
 * Generate fallback image URLs with different model name variations
 */
const generateFallbackVariations = (
  make: string,
  model: string,
  bodyType?: string
): Array<{ make: string; modelFamily: string; modelVariant: string }> => {
  const variations = [];
  
  // Original version
  variations.push({
    make: normalizeMakeName(make),
    modelFamily: normalizeModelName(make, model),
    modelVariant: getModelVariant(bodyType, make, model)
  });
  
  // Try with original model name (no normalization)
  variations.push({
    make: normalizeMakeName(make),
    modelFamily: model.toLowerCase().replace(/\s+/g, ''),
    modelVariant: 'suv'
  });
  
  // Try with generic SUV variant
  variations.push({
    make: normalizeMakeName(make),
    modelFamily: normalizeModelName(make, model),
    modelVariant: 'suv'
  });
  
  // For Mahindra Scorpio N, try multiple variations
  if (make.toLowerCase() === 'mahindra' && model.toLowerCase().includes('scorpio')) {
    variations.push(
      { make: 'mahindra', modelFamily: 'scorpio', modelVariant: 'suv' },
      { make: 'mahindra', modelFamily: 'scorpion', modelVariant: 'suv' },
      { make: 'mahindra', modelFamily: 'scorpio-n', modelVariant: 'suv' }
    );
  }
  
  // For Mahindra Thar, try multiple variations
  if (make.toLowerCase() === 'mahindra' && model.toLowerCase().includes('thar')) {
    variations.push(
      { make: 'mahindra', modelFamily: 'thar', modelVariant: 'offroad' },
      { make: 'mahindra', modelFamily: 'thar', modelVariant: 'convertible' },
      { make: 'mahindra', modelFamily: 'thar', modelVariant: 'suv' }
    );
  }
  
  return variations;
};

/**
 * Generate multiple car image URLs for different angles
 */
export const generateCarImageGallery = (
  car: { brand: string; model: string; bodyType?: string },
  paintId: string = "1",
  paintDescription: string = "white"
): string[] => {
  if (!car.brand || !car.model) return [];

  // Different angles for car gallery
  const angles = ['01', '05', '09', '13', '17', '21'];
  
  // Get the first (preferred) variation for generating URLs
  const variations = generateFallbackVariations(car.brand, car.model, car.bodyType);
  const primaryVariation = variations[0];

  return angles.map(angle => 
    generateImageUrl({
      make: primaryVariation.make,
      modelFamily: primaryVariation.modelFamily, 
      modelVariant: primaryVariation.modelVariant,
      paintId,
      paintDescription,
      angle,
      width: '800',
      fileType: 'png',
    })
  );
};

/**
 * Generate fallback URLs for a car model (useful for error recovery)
 */
export const generateCarImageGalleryWithFallbacks = (
  car: { brand: string; model: string; bodyType?: string },
  paintId: string = "1", 
  paintDescription: string = "white"
): Array<{ variation: string; urls: string[] }> => {
  if (!car.brand || !car.model) return [];

  const angles = ['01', '05', '09', '13', '17', '21'];
  const variations = generateFallbackVariations(car.brand, car.model, car.bodyType);

  return variations.map((variation, index) => ({
    variation: `${variation.make}_${variation.modelFamily}_${variation.modelVariant}`,
    urls: angles.map(angle => 
      generateImageUrl({
        make: variation.make,
        modelFamily: variation.modelFamily,
        modelVariant: variation.modelVariant,
        paintId,
        paintDescription,
        angle,
        width: '800',
        fileType: 'png',
      })
    )
  }));
};

/**
 * Fetch image with proper authorization (for server-side usage)
 * This would typically be used in a backend API route
 */
export const fetchImageWithAuth = async (imageUrl: string): Promise<Response> => {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'Authorization': `Bearer ${IMAGIN_CONFIG.authToken}`,
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching image with auth:', error);
    throw error;
  }
};

/**
 * Test if an image URL is accessible
 */
export const testImageUrl = async (imageUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error testing image URL:', error);
    return false;
  }
};

/**
 * Color options with generic paint IDs that work with the API
 */
export const COLOR_OPTIONS = [
  {
    id: "white",
    name: "White",
    hexCode: "#FFFFFF",
    paintId: "1",
    paintDescription: "white",
    isPopular: true,
  },
  {
    id: "black",
    name: "Black",
    hexCode: "#000000", 
    paintId: "2",
    paintDescription: "black",
    isPopular: true,
  },
  {
    id: "silver",
    name: "Silver",
    hexCode: "#C0C0C0",
    paintId: "3", 
    paintDescription: "silver",
    isPopular: true,
  },
  {
    id: "red",
    name: "Red",
    hexCode: "#DC2626",
    paintId: "4",
    paintDescription: "red", 
    isPopular: true,
  },
  {
    id: "blue", 
    name: "Blue",
    hexCode: "#2563EB",
    paintId: "5",
    paintDescription: "blue",
  },
] as const;

export type ColorOption = typeof COLOR_OPTIONS[number];