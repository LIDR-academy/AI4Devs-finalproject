/**
 * StateLabel Component
 * 
 * Displays meditation processing state as a styled badge.
 * Translates technical state names (PENDING, PROCESSING, etc.) 
 * to user-friendly Spanish labels with appropriate color coding.
 * 
 * Design:
 * - PENDING ("Queued") → Gray/neutral color
 * - PROCESSING ("Processing") → Blue/info color  
 * - COMPLETED ("Completed") → Green/success color
 * - FAILED ("Failed") → Red/error color
 */

import React from 'react';

export type ProcessingState = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface StateLabelProps {
  state: ProcessingState;
  label: string; // User-friendly label from backend ("Queued", "Processing", etc.)
  className?: string;
}

/**
 * Returns CSS class names for state-based styling.
 * Maps state to color scheme (semantic colors).
 */
const getStateColorClass = (state: ProcessingState): string => {
  const colorMap: Record<ProcessingState, string> = {
    PENDING: 'state-pending',      // Gray
    PROCESSING: 'state-processing', // Blue
    COMPLETED: 'state-completed',   // Green
    FAILED: 'state-failed'          // Red
  };
  return colorMap[state];
};

/**
 * StateLabel Component
 * 
 * Renders a badge showing the meditation's current processing state.
 * 
 * @example
 * ```tsx
 * <StateLabel state="COMPLETED" label="Completed" />
 * <StateLabel state="PROCESSING" label="Processing" />
 * ```
 */
export const StateLabel: React.FC<StateLabelProps> = ({ state, label, className = '' }) => {
  const colorClass = getStateColorClass(state);

  return (
    <span 
      className={`state-label ${colorClass} ${className}`}
      data-testid={`state-label-${state.toLowerCase()}`}
      role="status"
      aria-label={`Estado: ${label}`}
    >
      {label}
    </span>
  );
};

export default StateLabel;
