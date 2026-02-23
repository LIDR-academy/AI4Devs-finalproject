/**
 * OutputTypeIndicator Component
 * Capabilities 5 & 6: Determine Output Type
 * 
 * Displays "Generate Podcast" when no image selected.
 * Displays "Generate Video" when image selected (manual or AI-generated).
 * Updates immediately on image add/generate/remove (< 0.5s per SC-015).
 * 
 * Also serves as the main generation button (US3).
 */

import { useOutputType, useLocalText } from '@/state/composerStore';

interface OutputTypeIndicatorProps {
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function OutputTypeIndicator({ onClick, disabled = false, isLoading = false }: OutputTypeIndicatorProps) {
  const outputType = useOutputType();
  const localText = useLocalText();
  const isPodcast = outputType === 'PODCAST';
  const icon = isPodcast ? '🎧' : '🎬';
  const label = isPodcast ? 'Audio Only' : 'With Visuals';
  
  let typeText = isPodcast ? 'Generate Podcast' : 'Generate Video';
  if (isLoading) {
    typeText = isPodcast ? 'Generating Podcast...' : 'Generating Video...';
  }
  
  const isDisabled = !localText.trim() || disabled;

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`output-type-indicator output-type-indicator--${outputType.toLowerCase()}`}
      data-testid="output-type-indicator"
      role="button"
      aria-live="polite"
      aria-disabled={isDisabled}
      onClick={handleClick}
      style={{
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto',
        userSelect: 'none',
      }}
    >
      <span className="output-type-indicator__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="output-type-indicator__text">
        <span className="output-type-indicator__label">{label}</span>
        <span className="output-type-indicator__type" data-testid="output-type-value">
          {typeText}
        </span>
      </div>
    </div>
  );
}

export default OutputTypeIndicator;
