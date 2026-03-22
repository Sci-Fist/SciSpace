/**
 * Cloudinary Service
 * Handles media uploads to Cloudinary CDN
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a file to Cloudinary
 * @param {File} file - The file to upload
 * @param {string} folder - The folder to upload to
 * @returns {Promise<Object>} - The upload result with URL
 */
export const uploadToCloudinary = async (file, folder = 'portfolio') => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration missing. Check .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const result = await response.json();

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: result.resource_type
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Upload an image to Cloudinary
 * @param {File} file - The image file
 * @param {string} category - The category for organizing
 * @returns {Promise<Object>} - Upload result
 */
export const uploadImage = async (file, category = 'general') => {
  return uploadToCloudinary(file, `portfolio/images/${category}`);
};

/**
 * Upload a video to Cloudinary
 * @param {File} file - The video file
 * @param {string} category - The category for organizing
 * @returns {Promise<Object>} - Upload result
 */
export const uploadVideo = async (file, category = 'general') => {
  return uploadToCloudinary(file, `portfolio/videos/${category}`);
};

/**
 * Upload audio to Cloudinary
 * @param {File} file - The audio file
 * @param {string} category - The category for organizing
 * @returns {Promise<Object>} - Upload result
 */
export const uploadAudio = async (file, category = 'general') => {
  return uploadToCloudinary(file, `portfolio/audio/${category}`);
};

/**
 * Get optimized Cloudinary URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized URL
 */
export const getOptimizedUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const { width, height, quality = 'auto', format = 'auto' } = options;

  // Build transformation string
  const transformations = [];
  if (width || height) {
    transformations.push(`c_fill${width ? `,w_${width}` : ''}${height ? `,h_${height}` : ''}`);
  }
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  const transformString = transformations.join('/');

  // Insert transformations into URL
  return url.replace('/upload/', `/upload/${transformString}/`);
};

/**
 * Get thumbnail URL from Cloudinary URL
 * @param {string} url - Original Cloudinary URL
 * @param {number} size - Thumbnail size
 * @returns {string} - Thumbnail URL
 */
export const getThumbnailUrl = (url, size = 200) => {
  return getOptimizedUrl(url, { width: size, height: size });
};

export default {
  uploadToCloudinary,
  uploadImage,
  uploadVideo,
  uploadAudio,
  getOptimizedUrl,
  getThumbnailUrl
};