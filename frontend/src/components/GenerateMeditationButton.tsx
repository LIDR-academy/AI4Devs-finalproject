/**
 * GenerateMeditationButton Component
 * Triggers meditation content generation (video or audio)
 * 
 * Features:
 * - Disabled during generation
 * - Shows loading state
 * - Validates composition completeness
 * 
 * Usage:
 * ```tsx
 * <GenerateMeditationButton
 *   onClick={() => generate({ text, musicReference, imageReference })}
 *   disabled={!text || !musicReference}
 *   isLoading={isGenerating}
 * />
 * ```
 */

import React from 'react';

export interface GenerateMeditationButtonProps {
  /**
   * Handle button click (trigger generation)
   */
  onClick?: () => void;
  
  /**
   * Disable button (missing required fields or loading)
   */
  disabled?: boolean;
  
  /**
   * Show loading state
   */
  isLoading?: boolean;
  
  /**
   * Output type (affects button text)
   */
  outputType?: 'VIDEO' | 'PODCAST';
}

/**
 * GenerateMeditationButton Component
 * T026: Button to trigger meditation generation
 */
export function GenerateMeditationButton({
  onClick,
  disabled = false,
  isLoading = false,
  outputType = 'VIDEO',
}: GenerateMeditationButtonProps) {
  const buttonText = outputType === 'VIDEO' 
    ? '🎬 Generate Video' 
    : '🎙️ Generate Podcast';
  
  const loadingText = outputType === 'VIDEO'
    ? 'Creating video...'
    : 'Creating podcast...';

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`btn btn--primary btn--large generate-meditation-button ${
        isLoading ? 'btn--loading' : ''
      }`}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={isLoading ? loadingText : buttonText}
      aria-busy={isLoading}
      data-testid="generate-meditation-button"
    >
      {isLoading ? (
        <>
          <span className="btn__spinner" aria-hidden="true" />
          {loadingText}
        </>
      ) : (
        buttonText
      )}
    </button>
  );
}

export default GenerateMeditationButton;
