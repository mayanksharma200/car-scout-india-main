import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';
import crypto from 'crypto';

/**
 * S3 Upload Service
 * Handles uploading images from URLs to AWS S3
 */

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'ventes-car-portal';

/**
 * Download image from URL
 * @param {string} imageUrl - URL of the image to download
 * @returns {Promise<Buffer>} - Image buffer
 */
async function downloadImageFromURL(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error('[S3Upload] Error downloading image:', error.message);
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

/**
 * Generate a unique filename for S3
 * @param {string} carId - Car ID
 * @param {string} angle - Image angle/type
 * @param {string} extension - File extension (default: jpg)
 * @returns {string} - Unique filename
 */
function generateFileName(carId, angle, extension = 'jpg') {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(4).toString('hex');
  const sanitizedAngle = angle.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  
  // Sanitize car ID to handle spaces and special characters
  const sanitizedCarId = carId
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/\s+/g, '_')
    .toLowerCase();

  return `cars/${sanitizedCarId}/ideogram_${sanitizedAngle}_${timestamp}_${randomString}.${extension}`;
}

/**
 * Upload image buffer to S3
 * @param {Buffer} imageBuffer - Image data
 * @param {string} fileName - S3 file name/key
 * @param {string} contentType - MIME type (default: image/jpeg)
 * @returns {Promise<string>} - S3 URL of uploaded image
 */
async function uploadToS3(imageBuffer, fileName, contentType = 'image/jpeg') {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: imageBuffer,
      ContentType: contentType,
      ACL: 'public-read',
      CacheControl: 'max-age=31536000', // Cache for 1 year
    });

    await s3Client.send(command);

    // Construct the public URL
    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${fileName}`;

    console.log(`[S3Upload] Successfully uploaded: ${fileName}`);
    return s3Url;
  } catch (error) {
    console.error('[S3Upload] Error uploading to S3:', error.message);
    throw new Error(`S3 upload failed: ${error.message}`);
  }
}

/**
 * Upload image from URL to S3
 * @param {string} imageUrl - Source image URL (Ideogram URL)
 * @param {string} carId - Car ID
 * @param {string} angle - Image angle identifier
 * @returns {Promise<string>} - S3 URL
 */
async function uploadImageFromURL(imageUrl, carId, angle) {
  try {
    console.log(`[S3Upload] Uploading image for car ${carId}, angle: ${angle}`);

    // Download image from Ideogram
    const imageBuffer = await downloadImageFromURL(imageUrl);

    // Generate unique filename
    const fileName = generateFileName(carId, angle);

    // Upload to S3
    const s3Url = await uploadToS3(imageBuffer, fileName);

    return s3Url;
  } catch (error) {
    console.error(`[S3Upload] Failed to upload image for ${carId}:`, error.message);
    throw error;
  }
}

/**
 * Upload multiple images from URLs to S3
 * @param {Array<Object>} images - Array of image objects with url and angle properties
 * @param {string} carId - Car ID
 * @returns {Promise<Array<Object>>} - Array of results with S3 URLs
 */
async function uploadMultipleImages(images, carId) {
  const results = [];

  for (const image of images) {
    try {
      const s3Url = await uploadImageFromURL(image.url, carId, image.angle);

      results.push({
        success: true,
        originalUrl: image.url,
        s3Url: s3Url,
        angle: image.angle,
        resolution: image.resolution,
        is_safe: image.is_safe
      });

      console.log(`[S3Upload] ✅ Uploaded ${image.angle}: ${s3Url}`);
    } catch (error) {
      results.push({
        success: false,
        originalUrl: image.url,
        angle: image.angle,
        error: error.message
      });

      console.error(`[S3Upload] ❌ Failed ${image.angle}:`, error.message);
    }

    // Add small delay to avoid overwhelming S3
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return results;
}

/**
 * Delete image from S3
 * @param {string} s3Url - Full S3 URL of the image to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
async function deleteImageFromS3(s3Url) {
  try {
    if (!s3Url || !s3Url.includes(BUCKET_NAME)) {
      console.log('[S3Delete] Invalid S3 URL or not from our bucket:', s3Url);
      return false;
    }

    // Extract the key from the S3 URL
    // Format: https://bucket-name.s3.region.amazonaws.com/path/to/file.jpg
    const urlParts = s3Url.split(`${BUCKET_NAME}.s3.`)[1];
    if (!urlParts) {
      console.error('[S3Delete] Could not parse S3 URL:', s3Url);
      return false;
    }

    const key = urlParts.split('/').slice(1).join('/'); // Remove region and get the key

    console.log(`[S3Delete] Deleting from S3: ${key}`);

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`[S3Delete] Successfully deleted: ${key}`);
    return true;
  } catch (error) {
    console.error('[S3Delete] Error deleting from S3:', error.message);
    return false;
  }
}

/**
 * Delete multiple images from S3
 * @param {string[]} s3Urls - Array of S3 URLs to delete
 * @returns {Promise<Object>} - Results object with successful and failed deletions
 */
async function deleteMultipleImages(s3Urls) {
  const results = {
    successful: [],
    failed: [],
  };

  for (const url of s3Urls) {
    const success = await deleteImageFromS3(url);
    if (success) {
      results.successful.push(url);
    } else {
      results.failed.push(url);
    }
  }

  console.log(`[S3Delete] Deleted ${results.successful.length}/${s3Urls.length} images`);
  return results;
}

/**
 * Check if S3 is configured
 * @returns {boolean} - True if AWS credentials are configured
 */
function isConfigured() {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET_NAME
  );
}

export default {
  uploadImageFromURL,
  uploadMultipleImages,
  uploadToS3,
  downloadImageFromURL,
  generateFileName,
  deleteImageFromS3,
  deleteMultipleImages,
  isConfigured,
};
