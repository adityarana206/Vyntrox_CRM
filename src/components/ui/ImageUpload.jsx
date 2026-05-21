import React, { useRef } from 'react';
import { Button } from './index';
import { Ic } from './index';

const ImageUpload = ({ 
  onUpload, 
  uploading = false, 
  imageUrl = null, 
  onRemove, 
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  folder = 'vyntrox',
  className = '' 
}) => {
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      alert(`File size should be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

    if (onUpload) {
      await onUpload(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={`image-upload ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={uploading}
      />
      
      {imageUrl ? (
        <div className="image-preview">
          <img src={imageUrl} alt="Uploaded" className="preview-img" />
          <div className="preview-actions">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRemove}
              icon={<Ic.close width={14} height={14} />}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className={`upload-placeholder ${uploading ? 'uploading' : ''}`}
          onClick={!uploading ? handleClick : undefined}
        >
          {uploading ? (
            <div className="upload-spinner">
              <div className="spinner"></div>
              <span>Uploading...</span>
            </div>
          ) : (
            <>
              <Ic.upload width={32} height={32} />
              <span>Click to upload image</span>
              <small>Max {maxSize / 1024 / 1024}MB</small>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Add close icon to Ic if not exists
if (!Ic.close) {
  Ic.close = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}

if (!Ic.upload) {
  Ic.upload = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <path d="M17 8 12 3 7 8"/>
      <path d="M12 3v12"/>
    </svg>
  );
}

export default ImageUpload;
