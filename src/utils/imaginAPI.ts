// IMAGIN.studio API utility functions

interface ColorOption {
  id: string;
  name: string;
  hexCode: string;
  paintId: string;
  paintDescription: string;
  isPopular?: boolean;
  sprayCanInfo?: {
    sprayCanId: string;
    paintType: string;
    primarySprayCanRGB: string;
    primarySprayCanHighLightRGB: string;
    colourCluster: string;
  };
  paintSwatchInfo?: {
    primary: {
      highLight: string;
      lowLight: string;
    };
    secondary?: {
      highLight: string;
      lowLight: string;
    };
    tertiary?: {
      highLight: string;
      lowLight: string;
    };
  };
}

interface CarImageParams {
  make: string;
  modelFamily: string;
  modelVariant?: string;
  paintId: string;
  paintDescription: string;
  angle?: string;
  width?: string;
  fileType?: string;
  modelYear?: string;
  bodySize?: string;
  countryCode?: string;
  powerTrain?: string;
  transmission?: string;
  trim?: string;
}

// Paint API interfaces
interface PaintSprayCan {
  sprayCanId: string;
  paintType: string;
  primarySprayCanRGB: string;
  primarySprayCanHighLightRGB: string;
  colourCluster: string;
}

interface PaintSwatchDetail {
  paintId: string;
  paintDescription: string;
  primarySprayCan: PaintSprayCan;
  secondarySprayCan?: PaintSprayCan;
  tertiarySprayCan?: PaintSprayCan;
}

interface PaintSwatchesResponse {
  make: string;
  paints: Record<string, PaintSwatchDetail>;
}

interface MappedPaint {
  paintDescription: string;
  nativePaintDescriptions: string[];
  orderable: boolean;
  available: boolean;
}

interface PaintSwatch {
  primary: {
    highLight: string;
    lowLight: string;
  };
  secondary?: {
    highLight: string;
    lowLight: string;
  };
  tertiary?: {
    highLight: string;
    lowLight: string;
  };
}

interface PaintCombination {
  mapped: Record<string, MappedPaint>;
  paintSwatch: PaintSwatch;
}

interface PaintsResponse {
  paintData: {
    target: string;
    make: string;
    modelFamily: string;
    modelRange?: string;
    modelVariant?: string;
    bodySize?: string;
    modelYear?: string;
    trim?: string;
    powerTrain?: string;
    paintCombinations: Record<string, PaintCombination>;
  };
}

// API Configuration
const IMAGIN_CONFIG = {
  baseUrl: "https://cdn.imagin.studio/getimage",
  customer: "in-ventesavenues",
  authToken: "4D^xvkwX#3$#", // URL encoded token
};

/**
 * Generate a single car image URL with IMAGIN.studio API
 */
export const generateImageUrl = (params: CarImageParams): string => {
  const make = params.make.replace(/\s+/g, '').toLowerCase();
  const modelFamily = params.modelFamily.replace(/\s+/g, '').toLowerCase();

  const queryParams = new URLSearchParams({
    customer: IMAGIN_CONFIG.customer,
    make: make,
    modelFamily: modelFamily,
    modelRange: modelFamily, // Use same as modelFamily for better matching
    modelVariant: params.modelVariant || 'suv',
    modelYear: '2023', // Default to recent year
    bodySize: '4', // Medium/large vehicle size
    countryCode: 'IN', // India country code
    angle: params.angle || '01',
    fileType: params.fileType || 'webp', // WebP for better performance
    width: params.width || '800',
    aspectRatio: '1.85', // Widescreen aspect ratio
    zoomLevel: '60', // Good balance for car visibility
    zoomType: 'relative',
    groundPlaneAdjustment: '-0.5', // Slightly lower ground plane
    paintId: params.paintId,
    paintDescription: params.paintDescription.replace(/\s+/g, '+'), // URL encode spaces
    powerTrain: 'petrol', // Default powertrain
    transmission: 'manual', // Default transmission
    trim: 'standard', // Default trim level
  });

  return `${IMAGIN_CONFIG.baseUrl}?${queryParams.toString()}`;
};

/**
 * Generate multiple car image URLs for different angles
 */
export const generateCarImageGallery = (
  car: { brand: string; model: string; bodyType?: string; year?: string | number },
  paintId: string = "1",
  paintDescription: string = "white"
): string[] => {
  if (!car.brand || !car.model) return [];

  // Different angles for car gallery
  const angles = ['01', '05', '09', '13', '17', '21'];

  // Map body type to model variant and body size
  const getCarSpecs = (bodyType?: string) => {
    if (!bodyType) return { modelVariant: 'suv', bodySize: '4' };

    const bodyTypeMap: Record<string, { modelVariant: string; bodySize: string }> = {
      'hatchback': { modelVariant: 'hatchback', bodySize: '2' },
      'sedan': { modelVariant: 'sedan', bodySize: '3' },
      'suv': { modelVariant: 'suv', bodySize: '4' },
      'crossover': { modelVariant: 'suv', bodySize: '4' },
      'wagon': { modelVariant: 'wagon', bodySize: '3' },
      'coupe': { modelVariant: 'coupe', bodySize: '2' },
      'convertible': { modelVariant: 'convertible', bodySize: '2' },
      'pickup': { modelVariant: 'pickup', bodySize: '4' },
    };

    return bodyTypeMap[bodyType.toLowerCase()] || { modelVariant: 'suv', bodySize: '4' };
  };

  const carSpecs = getCarSpecs(car.bodyType);

  return angles.map(angle =>
    generateImageUrl({
      make: car.brand,
      modelFamily: car.model,
      modelVariant: carSpecs.modelVariant,
      paintId,
      paintDescription,
      angle,
      width: '800',
      fileType: 'webp',
      modelYear: car.year?.toString() || '2023',
      bodySize: carSpecs.bodySize,
      countryCode: 'IN',
      powerTrain: 'petrol',
      transmission: 'manual',
      trim: 'standard',
    })
  );
};

/**
 * Generate 360-degree car image URLs for smooth rotation
 */
export const generate360CarImages = (
  car: { brand: string; model: string; bodyType?: string; variant?: string; year?: string | number },
  paintId: string = "1",
  paintDescription: string = "white",
  totalAngles: number = 24
): string[] => {
  if (!car.brand || !car.model) return [];

  // Map body type to model variant and body size
  const getCarSpecs = (bodyType?: string) => {
    if (!bodyType) return { modelVariant: 'suv', bodySize: '4' };

    const bodyTypeMap: Record<string, { modelVariant: string; bodySize: string }> = {
      'hatchback': { modelVariant: 'hatchback', bodySize: '2' },
      'sedan': { modelVariant: 'sedan', bodySize: '3' },
      'suv': { modelVariant: 'suv', bodySize: '4' },
      'crossover': { modelVariant: 'suv', bodySize: '4' },
      'wagon': { modelVariant: 'wagon', bodySize: '3' },
      'coupe': { modelVariant: 'coupe', bodySize: '2' },
      'convertible': { modelVariant: 'convertible', bodySize: '2' },
      'pickup': { modelVariant: 'pickup', bodySize: '4' },
    };

    return bodyTypeMap[bodyType.toLowerCase()] || { modelVariant: 'suv', bodySize: '4' };
  };

  // Generate API angles - IMAGIN supports extended range with new parameters
  const getApiAngle = (index: number): string => {
    // Generate angles from 01 to 36 for full 360 degree coverage
    const angle = Math.floor((index * 36) / totalAngles) + 1;
    return angle.toString().padStart(2, '0');
  };

  const carSpecs = getCarSpecs(car.bodyType);

  return Array.from({ length: totalAngles }, (_, index) =>
    generateImageUrl({
      make: car.brand,
      modelFamily: car.model,
      modelVariant: car.variant || carSpecs.modelVariant,
      paintId,
      paintDescription,
      angle: getApiAngle(index),
      width: '800',
      fileType: 'webp',
      modelYear: car.year?.toString() || '2023',
      bodySize: carSpecs.bodySize,
      countryCode: 'IN',
      powerTrain: 'petrol',
      transmission: 'manual',
      trim: 'standard',
    })
  );
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
 * Fetch paint swatches for specific paint codes
 */
export const getPaintSwatches = async (
  make: string,
  paints: string[]
): Promise<PaintSwatchesResponse | null> => {
  try {
    const paintCodes = paints.join(',');
    const url = `https://cdn.imagin.studio/getPaintSwatches?customer=${IMAGIN_CONFIG.customer}&make=${make.toLowerCase()}&paints=${paintCodes}`;

    console.log('🎨 Fetching paint swatches:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('🎨 Paint swatches response:', data);

    return data;
  } catch (error) {
    console.error('❌ Error fetching paint swatches:', error);
    return null;
  }
};

/**
 * Fetch available paints for a specific car
 */
export const getCarPaints = async (
  make: string,
  modelFamily: string,
  options: {
    modelRange?: string;
    modelVariant?: string;
    bodySize?: string;
    modelYear?: string;
    trim?: string;
    powerTrain?: string;
    paintIds?: string[];
    countryCode?: string;
    transmission?: string;
  } = {}
): Promise<PaintsResponse | null> => {
  try {
    const params = new URLSearchParams({
      customer: IMAGIN_CONFIG.customer,
      target: 'car',
      make: make.toLowerCase(),
      modelFamily: modelFamily.toLowerCase(),
    });

    // Add enhanced parameters with defaults
    params.append('modelRange', options.modelRange || modelFamily.toLowerCase());
    params.append('modelVariant', options.modelVariant || 'suv');
    params.append('bodySize', options.bodySize || '4');
    params.append('modelYear', options.modelYear || '2023');
    params.append('countryCode', options.countryCode || 'IN');
    params.append('trim', options.trim || 'standard');
    params.append('powerTrain', options.powerTrain || 'petrol');
    params.append('transmission', options.transmission || 'manual');

    if (options.paintIds && options.paintIds.length > 0) {
      params.append('paintIds', options.paintIds.slice(0, 10).join(','));
    }

    const url = `https://cdn.imagin.studio/getPaints?${params.toString()}`;

    console.log('🎨 Fetching car paints with enhanced params:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('🎨 Car paints response:', data);

    return data;
  } catch (error) {
    console.error('❌ Error fetching car paints:', error);
    return null;
  }
};

/**
 * Fetch available paints for a car make
 */
export const getMakePaints = async (make: string): Promise<PaintsResponse | null> => {
  try {
    const url = `https://cdn.imagin.studio/getPaints?customer=${IMAGIN_CONFIG.customer}&target=make&make=${make.toLowerCase()}`;

    console.log('🎨 Fetching make paints:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('🎨 Make paints response:', data);

    return data;
  } catch (error) {
    console.error('❌ Error fetching make paints:', error);
    return null;
  }
};

/**
 * Convert IMAGIN paint data to color options format
 */
export const convertPaintToColorOption = (
  paintId: string,
  paintData: PaintSwatchDetail,
  isPopular: boolean = false
) => {
  const primaryColor = paintData.primarySprayCan;

  return {
    id: paintId,
    name: paintData.paintDescription
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    hexCode: primaryColor.primarySprayCanRGB,
    paintId: paintId,
    paintDescription: paintData.paintDescription,
    isPopular,
    sprayCanInfo: primaryColor,
  };
};

/**
 * Get car-specific paint options or fallback to static colors
 */
export const getCarPaintOptions = async (
  car: {
    brand: string;
    model: string;
    variant?: string;
    bodyType?: string;
    year?: string | number;
  }
): Promise<ColorOption[]> => {
  try {
    console.log('🎨 Using static color options for car:', car);
    return COLOR_OPTIONS;
  } catch (error) {
    console.error('❌ Error getting car paint options:', error);
    return COLOR_OPTIONS;
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
    id: "blue",
    name: "Blue",
    hexCode: "#2563EB",
    paintId: "4",
    paintDescription: "blue",
    isPopular: true,
  },
  {
    id: "red",
    name: "Red",
    hexCode: "#DC2626",
    paintId: "5",
    paintDescription: "red",
    isPopular: true,
  },
  {
    id: "green",
    name: "Green",
    hexCode: "#16A34A",
    paintId: "6",
    paintDescription: "green",
  },
  {
    id: "yellow",
    name: "Yellow",
    hexCode: "#FDE047",
    paintId: "7",
    paintDescription: "yellow",
  },
  {
    id: "orange",
    name: "Orange",
    hexCode: "#FB923C",
    paintId: "8",
    paintDescription: "orange",
  },
];

// Export the ColorOption type
export type { ColorOption };