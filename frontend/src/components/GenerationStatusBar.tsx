/**
 * GenerationStatusBar Component
 * Displays progress indicator during meditation generation
 * 
 * Features:
 * - Progress bar (determinate or indeterminate)
 * - Status label ("Creating meditation...")
 * - Accessible (aria-busy, aria-live)
 * 
 * Usage:
 * ```tsx
 * <GenerationStatusBar 
 *   progress={undefined} // Indeterminate
 *   message="Creating your meditation..."
 * />
 * 
 * <GenerationStatusBar 
 *   progress={65} // Determinate (0-100)
 *   message="Rendering video..."
 * />
 * ```
 */

import React from 'react';

export interface GenerationStatusBarProps {
  /**
   * Progress percentage (0-100) or undefined for indeterminate
   */
  progress?: number;
  
  /**
   * Status message to display
   * @default "Creating meditation..."
   */
  message?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * GenerationStatusBar Component
 * T025: Display generation progress with accessibility
 */
export function GenerationStatusBar({
  progress,
  message = 'Creating meditation...',
  className = '',
}: GenerationStatusBarProps) {
  const isIndeterminate = progress === undefined;
  const progressValue = isIndeterminate ? 0 : Math.min(100, Math.max(0, progress));

  return (
    <div 
      className={`generation-status-bar ${className}`}
      role="status"
      aria-busy="true"
      aria-live="polite"
      data-testid="generation-status-bar"
    >
      {/* Status Message */}
      <div className="generation-status-bar__message">
        <span className="generation-status-bar__spinner" aria-hidden="true">
          ⏳
        </span>
        <span className="generation-status-bar__text">{message}</span>
      </div>

      {/* Progress Bar */}
      <div className="generation-status-bar__track">
        <div
          className={`generation-status-bar__fill ${
            isIndeterminate ? 'generation-status-bar__fill--indeterminate' : ''
          }`}
          style={{
            width: isIndeterminate ? '100%' : `${progressValue}%`,
          }}
          role="progressbar"
          aria-label="Generation progress"
          aria-valuenow={isIndeterminate ? undefined : progressValue}
          aria-valuemin={0}
          aria-valuemax={100}
          data-testid="generation-status-bar-fill"
        />
      </div>

      {/* Progress Percentage (only for determinate) */}
      {!isIndeterminate && (
        <div className="generation-status-bar__percentage">
          {progressValue}%
        </div>
      )}
    </div>
  );
}

export default GenerationStatusBar;
