/**
 * Notification Service (T-031-FRONT)
 * 
 * Toast notification system for displaying block status change alerts.
 * Implements accessibility (ARIA) and auto-removal.
 */

import type { StatusTransition } from '../types/realtime';

/**
 * Toast display configuration constants
 */
const TOAST_AUTO_REMOVE_MS = 5000;
const TOAST_ANIMATION_MS = 300;
const TOAST_TOTAL_DISPLAY_MS = TOAST_AUTO_REMOVE_MS + TOAST_ANIMATION_MS;
const TOAST_Z_INDEX = 9999;

/**
 * Configuration for status transition notifications
 */
export const NOTIFICATION_CONFIG: Record<
  StatusTransition,
  {
    title: string;
    message: string;
    icon: string;
    borderColor: string;
  }
> = {
  processing_to_validated: {
    title: '✓ Validation Complete',
    message: 'Block {iso_code} has passed all validations',
    icon: '✓',
    borderColor: '#4caf50', // Green
  },
  processing_to_rejected: {
    title: '✗ Validation Failed',
    message: 'Block {iso_code} has validation errors',
    icon: '✗',
    borderColor: '#f44336', // Red
  },
  processing_to_error: {
    title: '⚠ Processing Error',
    message: 'An error occurred while processing block {iso_code}',
    icon: '⚠',
    borderColor: '#ff9800', // Orange
  },
};

/**
 * Create a toast DOM element with proper styling and accessibility.
 * 
 * @param content - Text content to display
 * @param borderColor - Left border color indicating notification type
 * @returns Configured toast HTML element
 * @internal
 */
function createToastElement(content: string, borderColor: string): HTMLDivElement {
  const toast = document.createElement('div');
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = content;

  toast.setAttribute(
    'style',
    `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: white;
      border-left: 4px solid ${borderColor};
      padding: 16px 24px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      max-width: 400px;
      z-index: ${TOAST_Z_INDEX};
      animation: slideIn ${TOAST_ANIMATION_MS}ms ease-out;
    `.trim()
  );

  return toast;
}

/**
 * Display a toast notification for a status transition.
 * 
 * @param transition - The status transition type
 * @param isoCode - The ISO code of the block
 */
export function showStatusNotification(
  transition: StatusTransition,
  isoCode: string
): void {
  const config = NOTIFICATION_CONFIG[transition];

  // Replace {iso_code} placeholder in message
  const message = config.message.replace('{iso_code}', isoCode);
  const content = `${config.title} — ${message}`;

  // Create and inject toast
  const toast = createToastElement(content, config.borderColor);
  document.body.appendChild(toast);

  // Auto-remove after configured time
  setTimeout(() => {
    toast.remove();
  }, TOAST_TOTAL_DISPLAY_MS);
}
