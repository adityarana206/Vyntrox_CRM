import { useState, useCallback } from 'react';
import { uploadFile, deleteImage } from '../services/uploadService';

export const useImageUpload = (folder = 'vyntrox') => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [publicId, setPublicId] = useState(null);

  const upload = useCallback(async (file) => {
    setUploading(true);
    setError(null);
    
    try {
      const result = await uploadFile(file, folder);
      
      if (result.success) {
        setImageUrl(result.data.url);
        setPublicId(result.data.publicId);
        return result.data;
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [folder]);

  const remove = useCallback(async () => {
    if (!publicId) return;
    
    try {
      await deleteImage(publicId);
      setImageUrl(null);
      setPublicId(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [publicId]);

  const reset = useCallback(() => {
    setImageUrl(null);
    setPublicId(null);
    setError(null);
    setUploading(false);
  }, []);

  return {
    uploading,
    error,
    imageUrl,
    publicId,
    upload,
    remove,
    reset,
    setImageUrl,
  };
};

export default useImageUpload;
