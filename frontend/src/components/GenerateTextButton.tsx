/**
 * GenerateTextButton Component
 * Capability 3: AI Text Generation/Enhancement
 * 
 * Button disabled during generation (FR-014).
 * Shows loading indicator during AI text generation.
 * Works with empty field, keywords, or existing content (unified).
 */

import { useComposerStore, useIsGeneratingText, useLocalText } from '@/state/composerStore';

interface GenerateTextButtonProps {
  disabled?: boolean;
  onGenerate?: () => void;
  isLoading?: boolean;
}

export function GenerateTextButton({ 
  disabled = false, 
  onGenerate,
  isLoading: externalLoading,
}: GenerateTextButtonProps) {
  const isGeneratingText = useIsGeneratingText();
  const localText = useLocalText();
  
  // Use external loading state if provided, otherwise use store state
  const isLoading = externalLoading ?? isGeneratingText;
  
  // Determine button text based on current text state
  const hasExistingText = localText.trim().length > 0;
  const buttonText = hasExistingText ? 'Enhance with AI' : 'Generate with AI';
  const loadingText = hasExistingText ? 'Enhancing...' : 'Generating...';
  
  // FR-014: Button disabled during generation
  const isDisabled = disabled || isLoading;
  
  return (
    <button
      className={`btn btn--primary generate-text-button ${isLoading ? 'btn--loading' : ''}`}
      onClick={onGenerate}
      disabled={isDisabled}
      aria-label={isLoading ? loadingText : buttonText}
      aria-busy={isLoading}
      data-testid="generate-text-button"
    >
      {isLoading ? (
        <>
          <span className="btn__spinner" aria-hidden="true" />
          {loadingText}
        </>
      ) : (
        <>
          ✨ {buttonText}
        </>
      )}
    </button>
  );
}

export default GenerateTextButton;
