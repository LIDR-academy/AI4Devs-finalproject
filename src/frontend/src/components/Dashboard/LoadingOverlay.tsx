/**
 * LoadingOverlay Component
 * T-0504-FRONT: Loading overlay for Dashboard
 * 
 * Displays a loading spinner with message while parts are being fetched
 */

import React from 'react';
import type { LoadingOverlayProps } from './Dashboard3D.types';
import { MESSAGES } from './Dashboard3D.constants';

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  const displayMessage = message || MESSAGES.LOADING;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 1000,
      }}
    >
      {/* Spinner SVG */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          marginBottom: '1rem',
          animation: 'spin 1s linear infinite',
        }}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
      </svg>

      {/* Message */}
      <p style={{ fontSize: '1rem', color: '#333' }}>
        {displayMessage}
      </p>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;
