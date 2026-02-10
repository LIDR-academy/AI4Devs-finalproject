/**
 * OutputTypeIndicator Component
 * Capabilities 5 & 6: Determine Output Type
 * 
 * Displays "Generate Podcast" when no image selected.
 * Displays "Generate Video" when image selected (manual or AI-generated).
 * Updates immediately on image add/generate/remove (< 0.5s per SC-015).
 */

import { useOutputType, useLocalText } from '@/state/composerStore';

export function OutputTypeIndicator() {
  const outputType = useOutputType();
  const localText = useLocalText();
  const isPodcast = outputType === 'PODCAST';
  const icon = isPodcast ? '🎧' : '🎬';
  const label = isPodcast ? 'Audio Only' : 'With Visuals';
  const typeText = isPodcast ? 'Generate Podcast' : 'Generate Video';
  const isDisabled = !localText.trim();

  return (
    <div
      className={`output-type-indicator output-type-indicator--${outputType.toLowerCase()}`}
      data-testid="output-type-indicator"
      role="status"
      aria-live="polite"
      style={{
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto',
        userSelect: isDisabled ? 'none' : 'auto',
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
