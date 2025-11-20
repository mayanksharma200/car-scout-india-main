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
 * Parse colors and color codes from semicolon-separated strings
 * @param {string} colors - Semicolon-separated color names
 * @param {string} colorCodes - Semicolon-separated color codes
 * @returns {Array<Object>} - Array of {name, code} objects
 */
function parseColors(colors, colorCodes) {
  if (!colors || typeof colors !== 'string') {
    return [];
  }

  const colorNames = colors.split(';').map(c => c.trim()).filter(c => c);
  const codes = colorCodes && typeof colorCodes === 'string'
    ? colorCodes.split(';').map(c => c.trim()).filter(c => c)
    : [];

  return colorNames.map((name, index) => ({
    name,
    code: codes[index] ? (codes[index].startsWith('#') ? codes[index] : `#${codes[index]}`) : null
  }));
}

/**
 * Generate individual prompt for a specific car angle and color
 * @param {Object} carData - Car data object
 * @param {string} carData.brand - Car brand/make
 * @param {string} carData.model - Car model
 * @param {string} carData.variant - Car variant/trim
 * @param {number} angleIndex - Index of the angle (0-7)
 * @param {string} specificColor - Specific color name for this generation
 * @param {string} colorCode - Hex color code for reference
 * @returns {string} - Specific Ideogram prompt for that angle
 */
function generateCarPrompt(carData, angleIndex = 0, specificColor = '', colorCode = '') {
  const { brand, model, variant } = carData;
  const carName = `${brand} ${model} ${variant || ''}`.trim();

  // Use provided specific color or extract from carData
  let colorToUse = specificColor;
  if (!colorToUse && carData.colors && typeof carData.colors === 'string') {
    const colorList = carData.colors.split(';');
    colorToUse = colorList[0].trim(); // Get first color
  }

  // Use specific color instruction
  const colorInstruction = colorToUse
    ? `The car must be painted in ${colorToUse} color${colorCode ? ` (${colorCode})` : ''}. Exact ${colorToUse} paint finish, consistent across all angles. `
    : 'Use the car\'s original factory color. ';

  // Common lighting instruction for color consistency
  const lightingInstruction = 'Bright, even studio lighting with neutral color temperature. Pure white background. Consistent lighting across all angles. ';

  // Define individual prompts for each specific angle
  // Each prompt is focused on ONE view only to avoid collages
  const anglePrompts = [
    // 0: Front 3/4 view (hero shot)
    `A professional image of a ${carName} in ${colorToUse || 'its original color'}, captured from the front 3/4 view. The camera should focus on the car's dynamic angle showing both the front grille and the side profile, creating a heroic perspective. The car should be positioned against a clean white background, showcasing its bold front profile and side lines with no distortion. In the image frame: the front bumper/bonnet on the left side of the image, and the rear boot visible on the right side of the image.`,

    // 1: Front view
    `A professional automotive photograph of a ${carName} in ${colorToUse || 'its original color'}, captured from directly in front. Centered composition showing the front grille, headlights, and front fascia symmetrically. Clean white studio background. Professional commercial automotive photography. Sharp focus, photorealistic, 4K quality.`,

    // 2: Left side profile
    `A professional image of a ${carName} in ${colorToUse || 'its original color'}, captured from the left side view. The camera should focus on the car's side profile from a slightly elevated angle, showing the smooth curves of the body, door handles, and wheels. The left side should be in profile, with a white background accentuating the car's length and shape. In the image frame: the front bonnet on the extreme left of the image, and the rear boot on the extreme right of the image.`,

    // 3: Right side profile
    `A professional image of a ${carName} in ${colorToUse || 'its original color'}, captured from the right side view. The camera should be positioned to clearly showcase the car's side profile, including the door lines, side mirrors, and wheel design. The car should be shown in profile, with the full right side visible against a clean white background. In the image frame: the rear boot on the extreme left edge of the image, and the front bonnet on the extreme right edge of the image.`,

    // 4: Rear view
    `A professional automotive photograph of a ${carName} in ${colorToUse || 'its original color'}, captured from directly behind. Centered composition showing the rear bumper, tail lights, and rear fascia. Clean white studio background. Professional commercial automotive photography. Sharp focus, photorealistic, 4K quality.`,

    // 5: Interior dashboard
    `Professional automotive interior photograph of a ${carName}. PRIORITY: The steering wheel MUST always be on the RIGHT side. View from driver's seat showing dashboard, steering wheel, and instrument cluster. Single interior angle showing the dashboard and controls. Clean, well-lit interior. Premium commercial photography quality. Sharp focus, photorealistic, 4K quality. CRITICAL: The steering wheel MUST be positioned on the RIGHT side of the interior (right-hand drive configuration). IMPORTANT: Show ONLY ONE interior view. NO collage, NO grid, NO multiple views, NO text, NO watermarks.`,

    // 6: Interior cabin wide
    `Professional automotive interior photograph of a ${carName}. PRIORITY: The steering wheel MUST always be on the RIGHT side. Wide angle view of the interior cabin showing front seats, dashboard, and spacious interior. Single wide interior view. Clean, well-lit interior shot. Premium commercial photography quality. Sharp focus, photorealistic, 4K quality. CRITICAL: The steering wheel MUST be positioned on the RIGHT side of the vehicle (right-hand drive configuration). IMPORTANT: Show ONLY ONE interior view. NO collage, NO grid, NO multiple views, NO text, NO watermarks.`,

    // 7: Interior steering wheel
    `Professional automotive interior photograph of a ${carName}. PRIORITY: The steering wheel MUST always be on the RIGHT side. Close-up of the steering wheel and center console from driver's perspective. Detail view of steering wheel, dashboard controls, and center console. Clean, well-lit interior shot. Premium commercial photography quality. Sharp focus, photorealistic, 4K quality. CRITICAL: The steering wheel MUST be positioned on the RIGHT side of the interior (right-hand drive configuration). The steering wheel must be clearly visible on the right side. IMPORTANT: Show ONLY ONE interior view. NO collage, NO grid, NO multiple views, NO text, NO watermarks.`
  ];

  return anglePrompts[angleIndex] || anglePrompts[0];
}

/**
 * Generate a single image for a specific angle
 * @param {Object} carData - Car data object
 * @param {number} angleIndex - Index of the angle (0-7)
 * @param {Object} options - Generation options
 * @param {number} options.seed - Optional seed from first image for consistency
 * @param {string} options.colorName - Specific color name for this generation
 * @param {string} options.colorCode - Hex color code for reference
 * @returns {Promise<Object>} - Single image result
 */
async function generateSingleAngleImage(carData, angleIndex, options = {}) {
  const apiKey = process.env.IDEOGRAM_API_KEY;

  if (!apiKey) {
    throw new Error('IDEOGRAM_API_KEY not found in environment variables');
  }

  const prompt = generateCarPrompt(carData, angleIndex, options.colorName || '', options.colorCode || '');
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

  // Negative prompt to avoid collages, color changes, lighting variations, and unwanted elements
  const negativePrompt = 'collage, multiple views, grid layout, multiple angles, multiple cars, different colors, color variations, color mismatch, different paint color, warm lighting, yellow tint, orange tint, cool lighting, blue tint, dramatic shadows, inconsistent lighting, different shade, darker color, lighter color, blurry, low quality, distorted, text overlay, watermark, logo, branding, people, hands, deformed car, unrealistic proportions, cartoon, wrong side view, reversed image, mirrored view, flipped image, mirror flip, left-hand drive, LHD, steering wheel on left, steering on left side, left side steering wheel';
  formData.append('negative_prompt', negativePrompt);

  const colorInfo = options.colorName ? ` in ${options.colorName}` : '';
  console.log(`[Ideogram] Generating ${angleName} (index ${angleIndex}) for ${carData.brand} ${carData.model}${colorInfo}`);
  console.log(`[Ideogram] Prompt: ${prompt.substring(0, 100)}...`);

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
    prompt: imageData.prompt,
    colorName: options.colorName || null,
    colorCode: options.colorCode || null
  };
}

/**
 * Generate all 8 car images using separate API calls for each angle
 * @param {Object} carData - Car data object
 * @param {Object} options - Generation options
 * @param {number} options.num_images - Number of images to generate per color (default 8 for all angles)
 * @param {string} options.aspect_ratio - Aspect ratio (default 16x9)
 * @param {string} options.rendering_speed - FLASH, TURBO, DEFAULT, or QUALITY (default TURBO)
 * @param {string} options.style_type - AUTO, GENERAL, REALISTIC, DESIGN, or FICTION (default REALISTIC)
 * @param {boolean} options.generateAllColors - Generate images for all colors (default true)
 * @param {Function} options.onProgress - Callback function for progress updates
 * @returns {Promise<Object>} - Generation result with image URLs grouped by color
 */
async function generateCarImages(carData, options = {}) {
  try {
    const apiKey = process.env.IDEOGRAM_API_KEY;

    if (!apiKey) {
      throw new Error('IDEOGRAM_API_KEY not found in environment variables');
    }

    const numAngles = options.num_images || 8;
    const generateAllColors = options.generateAllColors !== false; // Default true
    const onProgress = options.onProgress || (() => {}); // Progress callback

    // Parse colors from carData
    const colorVariants = parseColors(carData.colors, carData.color_codes);

    if (colorVariants.length === 0) {
      throw new Error('No colors found in car data. Please add colors to the car.');
    }

    console.log(`[Ideogram] Found ${colorVariants.length} color variants for ${carData.brand} ${carData.model}`);
    console.log(`[Ideogram] Colors: ${colorVariants.map(c => c.name).join(', ')}`);

    const colorResults = {};
    const globalErrors = [];
    let totalImagesGenerated = 0;

    // Generate images for each color
    for (const colorVariant of colorVariants) {
      const { name: colorName, code: colorCode } = colorVariant;

      console.log(`\n[Ideogram] 🎨 Generating ${numAngles} angles for color: ${colorName}${colorCode ? ` (${colorCode})` : ''}`);

      // Notify color start
      onProgress({
        status: 'color_start',
        color: colorName,
        colorCode,
        totalAngles: numAngles,
        message: `Starting generation for ${colorName}`
      });

      const images = [];
      const errors = [];
      let masterSeed = null; // Seed from first image for this color

      // Generate each angle for this specific color
      for (let i = 0; i < numAngles; i++) {
        const angleName = getAngleLabel(i);

        try {
          // Notify angle start
          onProgress({
            status: 'angle_start',
            color: colorName,
            angle: angleName,
            angleIndex: i + 1,
            totalAngles: numAngles,
            message: `Generating ${angleName} for ${colorName}...`
          });

          // For images after the first one, use the seed from the first image of this color
          const angleOptions = {
            ...options,
            colorName,
            colorCode
          };

          if (i > 0 && masterSeed) {
            angleOptions.seed = masterSeed;
          }

          const imageResult = await generateSingleAngleImage(carData, i, angleOptions);
          images.push(imageResult);

          // Save seed from first image to use for consistency in all other angles of this color
          if (i === 0 && imageResult.seed) {
            masterSeed = imageResult.seed;
            console.log(`[Ideogram] 🎨 Master seed for ${colorName}: ${masterSeed}`);
          }

          console.log(`[Ideogram] ✅ Generated ${imageResult.angle} for ${colorName} (${i + 1}/${numAngles})`);

          // Notify angle success
          onProgress({
            status: 'angle_success',
            color: colorName,
            angle: angleName,
            angleIndex: i + 1,
            totalAngles: numAngles,
            imageUrl: imageResult.url,
            message: `✅ Successfully generated ${angleName} for ${colorName}`
          });

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        } catch (error) {
          console.error(`[Ideogram] ❌ Failed to generate ${getAngleLabel(i)} for ${colorName}:`, error.message);

          const errorInfo = {
            angle: getAngleLabel(i),
            color: colorName,
            error: error.message
          };
          errors.push(errorInfo);

          // Notify angle failure
          onProgress({
            status: 'angle_failed',
            color: colorName,
            angle: angleName,
            angleIndex: i + 1,
            totalAngles: numAngles,
            error: error.message,
            message: `❌ Failed to generate ${angleName} for ${colorName}: ${error.message}`
          });
        }
      }

      // Store results for this color
      if (images.length > 0) {
        colorResults[colorName] = {
          colorCode,
          images,
          masterSeed,
          totalImages: images.length,
          primaryImage: images[0]?.url || null,
          errors: errors.length > 0 ? errors : undefined
        };
        totalImagesGenerated += images.length;
        console.log(`[Ideogram] ✅ Completed ${colorName}: ${images.length} images generated`);

        // Notify color complete
        onProgress({
          status: 'color_complete',
          color: colorName,
          successCount: images.length,
          failedCount: errors.length,
          message: `✅ Completed ${colorName}: ${images.length} images generated${errors.length > 0 ? `, ${errors.length} failed` : ''}`
        });
      } else {
        globalErrors.push({
          color: colorName,
          error: 'Failed to generate any images for this color'
        });
        console.error(`[Ideogram] ❌ Failed to generate any images for ${colorName}`);

        // Notify color failed
        onProgress({
          status: 'color_failed',
          color: colorName,
          message: `❌ Failed to generate any images for ${colorName}`
        });
      }

      // Delay between colors to avoid rate limiting
      if (colorVariants.indexOf(colorVariant) < colorVariants.length - 1) {
        console.log(`[Ideogram] ⏳ Waiting 3 seconds before next color...`);
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay between colors
      }
    }

    if (Object.keys(colorResults).length === 0) {
      throw new Error('Failed to generate any images for any color');
    }

    const results = {
      success: true,
      created: new Date().toISOString(),
      colorResults, // Grouped by color name
      totalColors: Object.keys(colorResults).length,
      totalImages: totalImagesGenerated,
      errors: globalErrors.length > 0 ? globalErrors : undefined
    };

    console.log(`\n[Ideogram] 🎉 Successfully generated ${results.totalImages} images across ${results.totalColors} colors`);
    if (globalErrors.length > 0) {
      console.log(`[Ideogram] ⚠️ ${globalErrors.length} colors failed completely`);
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
    0: 'front_3_4',          // Front right 3/4 angle view (hero shot)
    1: 'front_view',         // Front view
    2: 'left_side',          // Left side profile
    3: 'right_side',         // Right side profile
    4: 'rear_view',          // Rear view
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
  getAngleLabel,
  parseColors
};
