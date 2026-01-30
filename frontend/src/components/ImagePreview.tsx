/**
 * ImagePreview Component
 * Capability 8: Preview Image
 * 
 * Displays selected or AI-generated image clearly.
 * Preview displays within 1 second (SC-007).
 * Disabled/hidden when no image present.
 */

import { useCallback } from 'react';
import { useComposerStore, useSelectedImageId } from '@/state/composerStore';

interface ImagePreviewProps {
  previewUrl?: string;
  imageName?: string;
  disabled?: boolean;
  onRemove?: () => void;
}

export function ImagePreview({ 
  previewUrl,
  imageName = 'Selected Image',
  disabled = false,
  onRemove,
}: ImagePreviewProps) {
  const selectedImageId = useSelectedImageId();
  const clearImage = useComposerStore((state) => state.clearImage);
  
  const hasImage = !!selectedImageId;
  
  const handleRemove = useCallback(() => {
    clearImage();
    onRemove?.();
  }, [clearImage, onRemove]);
  
  if (!hasImage) {
    return (
      <div className="image-preview" data-testid="image-preview-empty">
        <div className="image-preview__container">
          <div className="image-preview__placeholder">
            <span>📷</span>
            <p>No image selected</p>
            <p className="image-preview__hint">Select an image or generate one with AI</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="image-preview" data-testid="image-preview">
      <div className="image-preview__container">
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt={imageName}
            className="image-preview__image"
            loading="eager"
            data-testid="image-preview-img"
          />
        ) : (
          <div className="image-preview__placeholder" data-testid="image-preview-placeholder">
            <span>🖼️</span>
            <p>{imageName}</p>
          </div>
        )}
      </div>
      <div className="image-preview__actions">
        <button
          className="btn btn--danger"
          onClick={handleRemove}
          disabled={disabled}
          aria-label="Remove image"
          data-testid="image-remove-button"
        >
          🗑️ Remove Image
        </button>
      </div>
    </div>
  );
}

export default ImagePreview;
