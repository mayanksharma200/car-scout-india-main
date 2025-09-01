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
 * Generate a single car image URL with IMAGIN.studio API
 */
export const generateImageUrl = (params: CarImageParams): string => {
  const queryParams = new URLSearchParams({
    customer: IMAGIN_CONFIG.customer,
    make: params.make.replace(/\s+/g, '').toLowerCase(),
    modelFamily: params.modelFamily.replace(/\s+/g, '').toLowerCase(),
    modelVariant: params.modelVariant || 'suv',
    angle: params.angle || '01',
    fileType: params.fileType || 'png',
    width: params.width || '800',
    paintId: params.paintId,
    paintDescription: params.paintDescription,
  });

  return `${IMAGIN_CONFIG.baseUrl}?${queryParams.toString()}`;
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
  
  // Map body type to model variant (simple mapping)
  const getModelVariant = (bodyType?: string): string => {
    if (!bodyType) return 'suv';
    
    const bodyTypeMap: Record<string, string> = {
      'hatchback': 'hatchback',
      'sedan': 'sedan', 
      'suv': 'suv',
      'crossover': 'suv',
      'wagon': 'wagon',
      'coupe': 'coupe',
      'convertible': 'convertible',
    };
    
    return bodyTypeMap[bodyType.toLowerCase()] || 'suv';
  };

  return angles.map(angle => 
    generateImageUrl({
      make: car.brand,
      modelFamily: car.model,
      modelVariant: getModelVariant(car.bodyType),
      paintId,
      paintDescription,
      angle,
      width: '800',
      fileType: 'png',
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