const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('vyntrox_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Upload image to Cloudinary via backend
 * @param {string} base64Image - Base64 encoded image
 * @param {string} folder - Folder name (default: 'vyntrox')
 * @returns {Promise<Object>} - Upload result
 */
export const uploadImage = async (base64Image, folder = 'vyntrox') => {
  try {
    const response = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ image: base64Image, folder }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload image');
    }
    
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteImage = async (publicId) => {
  try {
    const response = await fetch(`${API_BASE}/upload/image/${publicId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete image');
    }
    
    return data;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

/**
 * Convert file to base64
 * @param {File} file - Image file
 * @returns {Promise<string>} - Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Upload file directly
 * @param {File} file - Image file
 * @param {string} folder - Folder name
 * @returns {Promise<Object>} - Upload result
 */
export const uploadFile = async (file, folder = 'vyntrox') => {
  const base64 = await fileToBase64(file);
  return uploadImage(base64, folder);
};
