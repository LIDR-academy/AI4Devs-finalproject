/**
 * Notification Service (T-031-FRONT)
 * 
 * Toast notification system for displaying block status change alerts.
 * Implements accessibility (ARIA) and auto-removal.
 */

import type { StatusTransition } from '../types/realtime';

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

  // Create toast element
  const toast = document.createElement('div');
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  // Replace {iso_code} placeholder in message
  const message = config.message.replace('{iso_code}', isoCode);

  // Set content
  toast.textContent = `${config.title} — ${message}`;

  // Apply styles
  toast.setAttribute(
    'style',
    `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: white;
      border-left: 4px solid ${config.borderColor};
      padding: 16px 24px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      max-width: 400px;
      z-index: 9999;
      animation: slideIn 300ms ease-out;
    `.trim()
  );

  // Inject into DOM
  document.body.appendChild(toast);

  // Auto-remove after 5 seconds + 300ms animation
  setTimeout(() => {
    toast.remove();
  }, 5300);
}
