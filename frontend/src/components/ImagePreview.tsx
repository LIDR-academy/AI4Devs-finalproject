/**
 * ImagePreview Component
 * Capability 8: Preview Image
 * 
 * Displays selected or AI-generated image clearly.
 * Preview displays within 1 second (SC-007).
 * Disabled/hidden when no image present.
 */

import React from 'react';

interface ImagePreviewProps {
  previewUrl?: string;
  imageName?: string;
  disabled?: boolean;
  onRemove?: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  previewUrl,
  imageName = 'Selected Image',
  disabled = false,
  onRemove,
}) => {
  if (!previewUrl) {
    return (
      <div className="image-preview" data-testid="image-preview-empty">
        <div className="image-preview__container">
          <div className="image-preview__placeholder" data-testid="image-preview-placeholder">
            <span>📷</span>
            <p>{imageName === 'Selected Image' ? 'No image selected' : imageName}</p>
            <p className="image-preview__hint">Select an image or generate one with AI</p>
          </div>
        </div>
      </div>
    );
  }
  const [imgError, setImgError] = React.useState(false);
  return (
    <div className="image-preview" data-testid="image-preview" style={{ position: 'relative' }}>
      <div className="image-preview__container">
        {!imgError ? (
          <img
            src={previewUrl}
            alt={imageName}
            className="image-preview__image"
            loading="eager"
            data-testid="image-preview-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="image-preview__fallback" data-testid="image-preview-fallback">
            <span>❌</span>
            <p>Could not load image</p>
            <p style={{ fontSize: '0.8em', wordBreak: 'break-all' }}>{previewUrl}</p>
          </div>
        )}
        <button
          type="button"
          className="image-preview__close"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Remove image"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            color: 'white',
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 18,
            zIndex: 2,
          }}
          data-testid="image-remove-button"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;
