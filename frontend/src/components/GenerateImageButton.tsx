/**
 * GenerateImageButton Component
 * Capability 4: AI Image Generation
 * 
 * Button disabled during generation (FR-014).
 * Shows loading indicator during AI image generation.
 * Only enabled when no image is selected.
 * Updates outputType indicator when image generated.
 */


import { useIsGeneratingImage, useSelectedImageId, useLocalText } from '@/state/composerStore';
import { useGenerateImage } from '@/hooks/useGenerateImage';

interface GenerateImageButtonProps {
  disabled?: boolean;
  isLoading?: boolean;
}

export function GenerateImageButton({ 
  disabled = false,
  isLoading: externalLoading,
}: GenerateImageButtonProps) {
  const isGeneratingImage = useIsGeneratingImage();
  const selectedImageId = useSelectedImageId();
  const localText = useLocalText();
  const generateImage = useGenerateImage({ prompt: localText });

  // Use external loading state if provided, otherwise use store state
  const isLoading = (externalLoading ?? isGeneratingImage) || generateImage.isPending;

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
      onClick={() => generateImage.mutate(localText)}
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
