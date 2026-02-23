/**
 * GenerateTextButton Component
 * Capability 3: AI Text Generation/Enhancement
 * 
 * Button disabled during generation (FR-014).
 * Shows loading indicator during AI text generation.
 * Works with empty field, keywords, or existing content (unified).
 */

import { useIsGeneratingText, useLocalText, useTextError, useComposerStore } from '@/state/composerStore';
import { useState } from 'react';

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
  const textError = useTextError();
  const setTextError = useComposerStore((s) => s.setTextError);
  const [showToast, setShowToast] = useState(false);

  // Use external loading state if provided, otherwise use store state
  const isLoading = externalLoading ?? isGeneratingText;

  const isEnhancing = localText.trim().length > 0;
  const buttonText = isEnhancing ? 'Enhance with AI' : 'Generate with AI';
  const loadingText = isEnhancing ? 'Enhancing...' : 'Generating...';

  // FR-014: Button disabled during generation
  const isDisabled = disabled || isLoading;

  // Handler with validation
  const handleClick = () => {
    if (!localText.trim() || localText.trim().split(/\s+/).length < 1) {
      setTextError('Text cannot be empty. Please enter at least one word.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }
    setTextError(null);
    setShowToast(false);
    onGenerate?.();
  };

  return (
    <>
      <button
        className={`btn btn--primary generate-text-button ${isLoading ? 'btn--loading' : ''}`}
        onClick={handleClick}
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
      {showToast && textError && (
        <div className="toast-error">{textError}</div>
      )}
    </>
  );
}

export default GenerateTextButton;
