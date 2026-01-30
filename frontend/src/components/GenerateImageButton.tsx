/**
 * GenerateImageButton Component
 * Capability 4: AI Image Generation
 * 
 * Button disabled during generation (FR-014).
 * Shows loading indicator during AI image generation.
 * Only enabled when no image is selected.
 * Updates outputType indicator when image generated.
 */

import { useComposerStore, useIsGeneratingImage, useSelectedImageId } from '@/state/composerStore';

interface GenerateImageButtonProps {
  disabled?: boolean;
  onGenerate?: () => void;
  isLoading?: boolean;
}

export function GenerateImageButton({ 
  disabled = false, 
  onGenerate,
  isLoading: externalLoading,
}: GenerateImageButtonProps) {
  const isGeneratingImage = useIsGeneratingImage();
  const selectedImageId = useSelectedImageId();
  
  // Use external loading state if provided, otherwise use store state
  const isLoading = externalLoading ?? isGeneratingImage;
  
  // Only enabled when no image is selected
  const hasImage = !!selectedImageId;
  
  // FR-014: Button disabled during generation
  const isDisabled = disabled || isLoading || hasImage;
  
  const buttonText = 'Generate AI Image';
  const loadingText = 'Generating...';
  const disabledText = hasImage ? 'Image already selected' : buttonText;
  
  return (
    <button
      className={`btn btn--primary generate-image-button ${isLoading ? 'btn--loading' : ''}`}
      onClick={onGenerate}
      disabled={isDisabled}
      aria-label={isLoading ? loadingText : disabledText}
      aria-busy={isLoading}
      title={hasImage ? 'Remove current image first to generate a new one' : undefined}
      data-testid="generate-image-button"
    >
      {isLoading ? (
        <>
          <span className="btn__spinner" aria-hidden="true" />
          {loadingText}
        </>
      ) : (
        <>
          🎨 {buttonText}
        </>
      )}
    </button>
  );
}

export default GenerateImageButton;
