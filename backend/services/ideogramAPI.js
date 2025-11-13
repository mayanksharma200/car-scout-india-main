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
 * Generate a comprehensive automotive studio photoshoot prompt for a car
 * @param {Object} carData - Car data object
 * @param {string} carData.brand - Car brand/make
 * @param {string} carData.model - Car model
 * @param {string} carData.variant - Car variant/trim
 * @returns {string} - Complete Ideogram prompt
 */
function generateCarPrompt(carData) {
  const { brand, model, variant } = carData;

  const carName = `${brand} ${model} ${variant || ''}`.trim();

  const prompt = `Generate a high-quality automotive studio photoshoot of a ${carName}.
Showcase the car in multiple professional angles similar to CarDekho and CarWale:
1. Front angle 3/4 view
2. Rear angle 3/4 view
3. Full side profile
4. Front straight view
5. Rear straight view
6. Interior dashboard close-up
7. Interior cabin wide shot
8. Wheel and headlight close-up

Style: ultra clean, bright studio lighting, glossy reflections, premium commercial photography, no background noise, seamless white floor, realistic proportions, accurate car detailing, sharp focus, professional product photography.
The car should be prominently featured with perfect lighting and no distractions.
Do not add text, watermark, or branding.`;

  return prompt;
}

/**
 * Generate car images using Ideogram v3.0 API
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

    const prompt = generateCarPrompt(carData);

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('aspect_ratio', options.aspect_ratio || '16:9');
    formData.append('rendering_speed', options.rendering_speed || 'TURBO');
    formData.append('num_images', options.num_images || 8);
    formData.append('style_type', options.style_type || 'REALISTIC');
    formData.append('magic_prompt', 'AUTO'); // Let Ideogram enhance the prompt

    // Optional: Add negative prompt to avoid unwanted elements
    const negativePrompt = 'blurry, low quality, distorted, text overlay, watermark, logo, branding, people, hands, deformed car, unrealistic proportions, cartoon';
    formData.append('negative_prompt', negativePrompt);

    console.log(`[Ideogram] Generating images for ${carData.brand} ${carData.model}`);
    console.log(`[Ideogram] Prompt: ${prompt.substring(0, 100)}...`);

    const response = await axios.post(
      `${IDEOGRAM_API_BASE_URL}/generate`,
      formData,
      {
        headers: {
          'Api-Key': apiKey,
          ...formData.getHeaders()
        },
        timeout: 120000 // 2 minutes timeout for image generation
      }
    );

    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from Ideogram API');
    }

    const results = {
      success: true,
      created: response.data.created,
      images: response.data.data.map((img, index) => ({
        url: img.url,
        is_safe: img.is_image_safe,
        seed: img.seed,
        resolution: img.resolution,
        angle: getAngleLabel(index), // Map to angle labels
        prompt: img.prompt
      })),
      totalImages: response.data.data.length,
      primaryImage: response.data.data[0]?.url || null
    };

    console.log(`[Ideogram] Successfully generated ${results.totalImages} images`);

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
    0: 'front_3_4',        // Front 3/4 view
    1: 'rear_3_4',         // Rear 3/4 view
    2: 'side_profile',     // Side profile
    3: 'front_straight',   // Front straight
    4: 'rear_straight',    // Rear straight
    5: 'interior_dash',    // Interior dashboard
    6: 'interior_cabin',   // Interior cabin
    7: 'detail_shot'       // Wheel/headlight detail
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
  generateCarPrompt,
  downloadImage,
  formatForDatabase,
  isConfigured,
  testConnection,
  getAngleLabel
};
