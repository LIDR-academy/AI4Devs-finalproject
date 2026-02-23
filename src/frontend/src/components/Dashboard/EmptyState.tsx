/**
 * EmptyState Component
 * T-0504-FRONT: Empty state placeholder for Dashboard
 * 
 * Displays a message when no parts are loaded in the 3D canvas
 */

import React from 'react';
import type { EmptyStateProps } from './Dashboard3D.types';
import { MESSAGES } from './Dashboard3D.constants';

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message,
  error,
  actionLabel, 
  actionHref,
  onAction 
}) => {
  const displayMessage = message || MESSAGES.EMPTY_STATE;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '2rem',
        color: '#666',
      }}
    >
      {/* Error Banner (displayed above icon if error exists) */}
      {error && (
        <div
          role="alert"
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.5rem',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '6px',
            color: '#991B1B',
            fontSize: '0.875rem',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}
      {/* Icon SVG */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginBottom: '1rem' }}
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>

      {/* Message */}
      <p style={{ fontSize: '1.125rem', textAlign: 'center', marginBottom: '1rem' }}>
        {displayMessage}
      </p>

      {/* Optional Action Button or Link */}
      {actionLabel && (
        actionHref ? (
          <a
            href={actionHref}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            {actionLabel}
          </a>
        ) : onAction ? (
          <button
            onClick={onAction}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {actionLabel}
          </button>
        ) : null
      )}
    </div>
  );
};

export default EmptyState;
