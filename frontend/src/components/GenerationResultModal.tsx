/**
 * GenerationResultModal Component
 * Displays generation result (success with download or error)
 * 
 * Features:
 * - Success screen with download button (presigned URL)
 * - Error screen with retry option
 * - Accessible (role="dialog", aria-modal)
 * 
 * Usage:
 * ```tsx
 * <GenerationResultModal
 *   isOpen={isSuccess || isError}
 *   result={generationResult}
 *   error={errorMessage}
 *   onClose={() => reset()}
 *   onRetry={() => retry()}
 * />
 * ```
 */
import type { GenerationResponse } from '@/api/generation-client';

export interface GenerationResultModalProps {
  /**
   * Modal open/close state
   */
  isOpen: boolean;
  
  /**
   * Generation result (on success)
   */
  result?: GenerationResponse;
  
  /**
   * Error message (on failure)
   */
  error?: string;
  
  /**
   * Handle modal close
   */
  onClose: () => void;
  
  /**
   * Handle retry (on error)
   */
  onRetry?: () => void;
}

/**
 * GenerationResultModal Component
 * T026: Display generation result (success/error)
 */
export function GenerationResultModal({
  isOpen,
  result,
  error,
  onClose,
  onRetry,
}: GenerationResultModalProps) {
  if (!isOpen) return null;

  const isSuccess = !!result && !error;
  const isError = !!error;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      data-testid="generation-result-modal"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="generation-result-title"
      >
        {/* Success State */}
        {isSuccess && result && (
          <div className="generation-result generation-result--success">
            <div className="generation-result__icon">✅</div>
            <h2 id="generation-result-title" className="generation-result__title">
              Generation Complete!
            </h2>
            <p className="generation-result__message">
              Your {result.type === 'VIDEO' ? 'video' : 'podcast'} meditation has been created successfully.
            </p>

            {/* Meditation Details */}
            <div className="generation-result__details">
              <div className="generation-result__detail">
                <span className="label">Type:</span>
                <span className="value">{result.type}</span>
              </div>
              {result.durationSeconds && (
                <div className="generation-result__detail">
                  <span className="label">Duration:</span>
                  <span className="value">
                    {formatDuration(result.durationSeconds)}
                  </span>
                </div>
              )}
            </div>

            {/* Download Buttons */}
            <div className="generation-result__actions">
              {result.mediaUrl && (
                <a
                  href={result.mediaUrl}
                  download
                  className="btn btn--primary btn--large"
                  data-testid="download-media-button"
                >
                  📥 Download {result.type === 'VIDEO' ? 'Video' : 'Audio'}
                </a>
              )}
              {result.subtitleUrl && (
                <a
                  href={result.subtitleUrl}
                  download
                  className="btn btn--secondary"
                  data-testid="download-subtitles-button"
                >
                  📄 Download Subtitles
                </a>
              )}
            </div>

            <button
              onClick={onClose}
              className="btn btn--text generation-result__close"
              data-testid="close-result-button"
            >
              Close
            </button>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="generation-result generation-result--error">
            <div className="generation-result__icon">❌</div>
            <h2 id="generation-result-title" className="generation-result__title">
              Generation Failed
            </h2>
            <p className="generation-result__message">{error}</p>

            <div className="generation-result__actions">
              {onRetry && (
                <button
                  onClick={() => {
                    onClose();
                    onRetry();
                  }}
                  className="btn btn--primary"
                  data-testid="retry-generation-button"
                >
                  🔄 Try Again
                </button>
              )}
              <button
                onClick={onClose}
                className="btn btn--secondary"
                data-testid="close-error-button"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Format duration in seconds to human-readable format
 */
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}

export default GenerationResultModal;
