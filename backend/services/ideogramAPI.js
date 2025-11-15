import FormData from 'form-data';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

/**
 * Ideogram API Service
 * Handles AI-powered car image generation using Ideogram v3.0
 */

const IDEOGRAM_API_BASE_URL = 'https://api.ideogram.ai/v1/ideogram-v3';

/**
 * Generate individual prompt for a specific car angle
 * @param {Object} carData - Car data object
 * @param {string} carData.brand - Car brand/make
 * @param {string} carData.model - Car model
 * @param {string} carData.variant - Car variant/trim
 * @param {number} angleIndex - Index of the angle (0-7)
 * @returns {string} - Specific Ideogram prompt for that angle
 */
function generateCarPrompt(carData, angleIndex = 0, colorReference = '') {
  const { brand, model, variant } = carData;
  const carName = `${brand} ${model} ${variant || ''}`.trim();

  // Add color consistency instruction if we have a reference from previous angles
  const colorInstruction = colorReference
    ? `The car must be in ${colorReference} color, exactly matching the reference. Same paint color, same finish, consistent across all angles. `
    : 'Use the car\'s original factory color. ';

  // Define individual prompts for each specific angle
  // Each prompt is focused on ONE view only to avoid collages
  const anglePrompts = [
    // 0: Front 3/4 view (hero shot)
    `Professional automotive studio photograph of a ${carName}. ${colorInstruction}Front three-quarter angle view showing the front and driver side of the car. Single car in hero shot composition. Clean white studio background with soft floor reflections. Premium commercial photography quality, similar to CarDekho. Sharp focus, photorealistic, 4K quality. IMPORTANT: Show ONLY ONE car from ONE angle. Maintain consistent car color and finish. NO collage, NO grid, NO multiple views, NO text, NO watermarks.`,

    // 1: Left side profile
    `Professional automotive studio photograph of a ${carName}. ${colorInstruction}Complete left side profile view. Single car positioned parallel to camera showing full side view. Clean white studio background with soft floor reflections. Premium commercial photography quality, similar to CarWale. Sharp focus, photorealistic, 4K quality. IMPORTANT: Show ONLY ONE car from ONE angle. Maintain consistent car color and finish. NO collage, NO grid, NO multiple views, NO text, NO watermarks.`,

    // 2: Rear view
    `Professional automotive studio photograph of a ${carName}. ${colorInstruction}Rear view photograph showing the back of the car with tail lights and rear design. Single car, straight-on rear composition. Clean white studio background with soft floor reflections. Premium commercial photography quality. Sharp focus, photorealistic, 4K quality. IMPORTANT: Show ONLY ONE car from ONE angle. Maintain consistent car color and finish. NO collage, NO grid, NO multiple views, NO text, NO watermarks.`,

    // 3: Right side profile
    `Professional automotive studio photograph of a ${carName}. ${colorInstruction}Complete right side profile view. Single car positioned parallel to camera showing full right side view. Clean white studio background with soft floor reflections. Premium commercial photography quality. Sharp focus, photorealistic, 4K quality. IMPORTANT: Show ONLY ONE car from ONE angle. Maintain consistent car color and finish. NO collage, NO grid, NO multiple views, NO text, NO watermarks.`,

    // 4: Detail shot (wheel/headlight)
    `Professional automotive studio close-up photograph of a ${carName}. ${colorInstruction}Detailed shot focusing on front wheel and headlight area. Single focused detail composition with dramatic lighting. Clean studio background. Premium commercial photography quality. Sharp focus, photorealistic, 4K quality. IMPORTANT: Show ONLY ONE detail angle. Maintain consistent car color and finish. NO collage, NO grid, NO multiple views, NO text, NO watermarks.`,

    // 5: Interior dashboard
    `Professional automotive interior photograph of a ${carName}. Close-up view of dashboard, steering wheel, and instrument cluster from driver's seat perspective. Single interior angle. Clean, well-lit interior shot. Premium commercial photography quality. Sharp focus, photorealistic, 4K quality. IMPORTANT: Show ONLY ONE interior angle. NO collage, NO grid, NO multiple views, NO text, NO watermarks.`,

    // 6: Interior cabin wide
    `Professional automotive interior photograph of a ${carName}. Wide angle interior showing front seats, dashboard, and cabin space. Single wide interior view showcasing spaciousness. Clean, well-lit interior shot. Premium commercial photography quality. Sharp focus, photorealistic, 4K quality. IMPORTANT: Show ONLY ONE interior angle. NO collage, NO grid, NO multiple views, NO text, NO watermarks.`,

    // 7: Interior steering wheel
    `Professional automotive interior photograph of a ${carName}. Close-up of steering wheel and center console from driver's seat. Single interior detail view. Clean, well-lit interior shot with focus on controls. Premium commercial photography quality. Sharp focus, photorealistic, 4K quality. IMPORTANT: Show ONLY ONE interior angle. NO collage, NO grid, NO multiple views, NO text, NO watermarks.`
  ];

  return anglePrompts[angleIndex] || anglePrompts[0];
}

/**
 * Generate a single image for a specific angle
 * @param {Object} carData - Car data object
 * @param {number} angleIndex - Index of the angle (0-7)
 * @param {Object} options - Generation options
 * @param {number} options.seed - Optional seed from first image for consistency
 * @param {string} options.colorReference - Optional color description from first image
 * @returns {Promise<Object>} - Single image result
 */
async function generateSingleAngleImage(carData, angleIndex, options = {}) {
  const apiKey = process.env.IDEOGRAM_API_KEY;

  if (!apiKey) {
    throw new Error('IDEOGRAM_API_KEY not found in environment variables');
  }

  const prompt = generateCarPrompt(carData, angleIndex, options.colorReference || '');
  const angleName = getAngleLabel(angleIndex);

  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('aspect_ratio', options.aspect_ratio || '16x9');
  formData.append('rendering_speed', options.rendering_speed || 'TURBO');
  formData.append('num_images', 1); // Generate only 1 image per call
  formData.append('style_type', options.style_type || 'REALISTIC');
  formData.append('magic_prompt', 'AUTO');

  // Use seed from first image to maintain consistency across angles
  if (options.seed) {
    formData.append('seed', options.seed);
    console.log(`[Ideogram] Using seed ${options.seed} for consistency`);
  }

  // Negative prompt to avoid collages, color changes, and unwanted elements
  const negativePrompt = 'collage, multiple views, grid layout, multiple angles, multiple cars, different colors, color variations, blurry, low quality, distorted, text overlay, watermark, logo, branding, people, hands, deformed car, unrealistic proportions, cartoon';
  formData.append('negative_prompt', negativePrompt);

  console.log(`[Ideogram] Generating ${angleName} for ${carData.brand} ${carData.model}`);

  const response = await axios.post(
    `${IDEOGRAM_API_BASE_URL}/generate`,
    formData,
    {
      headers: {
        'Api-Key': apiKey,
        ...formData.getHeaders()
      },
      timeout: 120000
    }
  );

  if (!response.data || !response.data.data || response.data.data.length === 0) {
    throw new Error(`Failed to generate ${angleName}`);
  }

  const imageData = response.data.data[0]; // Get first (and only) image

  return {
    url: imageData.url,
    is_safe: imageData.is_image_safe,
    seed: imageData.seed,
    resolution: imageData.resolution,
    angle: angleName,
    prompt: imageData.prompt
  };
}

/**
 * Generate all 8 car images using separate API calls for each angle
 * @param {Object} carData - Car data object
 * @param {Object} options - Generation options
 * @param {number} options.num_images - Number of images to generate (default 8 for all angles)
 * @param {string} options.aspect_ratio - Aspect ratio (default 16x9)
 * @param {string} options.rendering_speed - FLASH, TURBO, DEFAULT, or QUALITY (default TURBO)
 * @param {string} options.style_type - AUTO, GENERAL, REALISTIC, DESIGN, or FICTION (default REALISTIC)
 * @returns {Promise<Object>} - Generation result with image URLs
 */
async function generateCarImages(carData, options = {}) {
  try {
    const apiKey = process.env.IDEOGRAM_API_KEY;

    if (!apiKey) {
      throw new Error('IDEOGRAM_API_KEY not found in environment variables');
    }

    const numImages = options.num_images || 8;
    console.log(`[Ideogram] Starting generation of ${numImages} individual images for ${carData.brand} ${carData.model}`);

    const images = [];
    const errors = [];
    let masterSeed = null; // Seed from first image for color consistency
    let colorReference = ''; // Color description from first image

    // Generate each angle separately to avoid collages
    for (let i = 0; i < numImages; i++) {
      try {
        // For images after the first one, use the seed from the first image
        const angleOptions = { ...options };
        if (i > 0 && masterSeed) {
          angleOptions.seed = masterSeed;
          angleOptions.colorReference = colorReference;
        }

        const imageResult = await generateSingleAngleImage(carData, i, angleOptions);
        images.push(imageResult);

        // Save seed from first image to use for consistency in all other angles
        if (i === 0 && imageResult.seed) {
          masterSeed = imageResult.seed;
          // Extract color reference from first image (you could use AI to detect this,
          // but for now we'll just add a generic instruction)
          colorReference = 'the same';
          console.log(`[Ideogram] 🎨 Master seed set: ${masterSeed} for color consistency`);
        }

        console.log(`[Ideogram] ✅ Generated ${imageResult.angle} (${i + 1}/${numImages})`);

        // Small delay to avoid rate limiting
        if (i < numImages - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      } catch (error) {
        console.error(`[Ideogram] ❌ Failed to generate angle ${i}:`, error.message);
        errors.push({
          angle: getAngleLabel(i),
          error: error.message
        });
      }
    }

    if (images.length === 0) {
      throw new Error('Failed to generate any images');
    }

    const results = {
      success: true,
      created: new Date().toISOString(),
      images: images,
      totalImages: images.length,
      primaryImage: images[0]?.url || null,
      masterSeed: masterSeed, // Include master seed in results
      errors: errors.length > 0 ? errors : undefined
    };

    console.log(`[Ideogram] ✅ Successfully generated ${results.totalImages} individual images with consistent styling`);
    if (errors.length > 0) {
      console.log(`[Ideogram] ⚠️ ${errors.length} images failed to generate`);
    }

    return results;
  } catch (error) {
    console.error('[Ideogram] Error generating images:', error.message);

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      // Handle specific API errors
      if (status === 401) {
        throw new Error('Invalid Ideogram API key');
      } else if (status === 422) {
        throw new Error('Prompt failed safety check - please refine car data');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      } else if (status === 400) {
        throw new Error(`Invalid request: ${JSON.stringify(errorData)}`);
      }
    }

    throw error;
  }
}

/**
 * Download an image from URL and save it locally (optional utility)
 * @param {string} imageUrl - URL of the image to download
 * @param {string} outputPath - Local path to save the image
 * @returns {Promise<string>} - Path to saved image
 */
async function downloadImage(imageUrl, outputPath) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, response.data);
    console.log(`[Ideogram] Image downloaded to ${outputPath}`);

    return outputPath;
  } catch (error) {
    console.error('[Ideogram] Error downloading image:', error.message);
    throw error;
  }
}

/**
 * Map image index to angle label for consistency with existing system
 * @param {number} index - Image index (0-7)
 * @returns {string} - Angle label
 */
function getAngleLabel(index) {
  const angleMap = {
    0: 'front_3_4',          // Front 3/4 angle view (hero shot)
    1: 'left_side',          // Left side profile
    2: 'rear_view',          // Rear view
    3: 'right_side',         // Right side profile
    4: 'detail_shot',        // Detail shot (wheel/headlight)
    5: 'interior_dash',      // Interior dashboard
    6: 'interior_cabin',     // Interior cabin wide shot
    7: 'interior_steering'   // Interior steering wheel
  };

  return angleMap[index] || `angle_${index}`;
}

/**
 * Format Ideogram images for database storage
 * @param {Object} generationResult - Result from generateCarImages
 * @param {string} carId - Car ID for reference
 * @returns {Object} - Formatted object for database storage
 */
function formatForDatabase(generationResult, carId) {
  if (!generationResult.success) {
    return {
      car_id: carId,
      source: 'ideogram',
      valid: false,
      error: 'Generation failed',
      last_updated: new Date().toISOString()
    };
  }

  return {
    car_id: carId,
    source: 'ideogram',
    primary: generationResult.primaryImage,
    angles: generationResult.images.map(img => ({
      angle: img.angle,
      url: img.url,
      resolution: img.resolution,
      is_safe: img.is_safe,
      seed: img.seed
    })),
    total_images: generationResult.totalImages,
    created: generationResult.created,
    valid: true,
    last_updated: new Date().toISOString()
  };
}

/**
 * Validate if Ideogram API is configured correctly
 * @returns {boolean} - True if API key is configured
 */
function isConfigured() {
  return !!process.env.IDEOGRAM_API_KEY;
}

/**
 * Test Ideogram API connection
 * @returns {Promise<Object>} - Test result
 */
async function testConnection() {
  try {
    if (!isConfigured()) {
      return {
        success: false,
        error: 'IDEOGRAM_API_KEY not configured'
      };
    }

    // Generate a simple test image
    const testCarData = {
      brand: 'Toyota',
      model: 'Camry',
      variant: 'Hybrid'
    };

    const result = await generateCarImages(testCarData, {
      num_images: 1,
      rendering_speed: 'FLASH' // Fast for testing
    });

    return {
      success: true,
      message: 'Ideogram API connection successful',
      testImage: result.primaryImage
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  generateCarImages,
  generateSingleAngleImage,
  generateCarPrompt,
  downloadImage,
  formatForDatabase,
  isConfigured,
  testConnection,
  getAngleLabel
};
