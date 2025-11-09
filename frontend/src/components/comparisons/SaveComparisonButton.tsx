/**
 * SaveComparisonButton Component
 *
 * Button to save comparison results to the database for future reference.
 * Handles states: default, loading, success, error, and already saved.
 *
 * Features:
 * - Checks for existing comparison before saving
 * - Shows loading spinner during save
 * - Displays success message with link to saved comparison
 * - Shows error messages with retry capability
 * - Responsive and dark mode compatible
 *
 * @author AI4Devs
 * @date 2025-10-27
 */

import { AlertCircle, Bookmark, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { comparisonsService } from '../../services/comparisons.service';
import type { ComparisonResult } from '../../types/comparison.types';

/**
 * Component state type
 */
type ButtonState = 'default' | 'loading' | 'success' | 'error' | 'exists';

/**
 * Props for SaveComparisonButton component
 */
export interface SaveComparisonButtonProps {
  /** Complete comparison result to save */
  comparisonResult: ComparisonResult;
  /** Optional callback after successful save */
  onSaveSuccess?: (comparisonId: number) => void;
  /** Optional custom className */
  className?: string;
}

/**
 * SaveComparisonButton - Button to save comparison results
 */
const SaveComparisonButton: React.FC<SaveComparisonButtonProps> = ({
  comparisonResult,
  onSaveSuccess,
  className = '',
}) => {
  const [state, setState] = useState<ButtonState>('default');
  const [savedComparisonId, setSavedComparisonId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  /**
   * Handle save button click
   */
  const handleSave = async () => {
    try {
      setState('loading');
      setErrorMessage('');

      // Check if comparison already exists
      const checkResponse = await comparisonsService.checkComparisonExists(
        comparisonResult.source_version_id,
        comparisonResult.target_version_id
      );

      if (checkResponse.exists && checkResponse.comparison_id) {
        setState('exists');
        setSavedComparisonId(checkResponse.comparison_id);
        return;
      }

      // Save comparison
      const saveResponse = await comparisonsService.saveComparison(comparisonResult);
      
      setState('success');
      setSavedComparisonId(saveResponse.comparison_id);

      // Call success callback
      if (onSaveSuccess) {
        onSaveSuccess(saveResponse.comparison_id);
      }
    } catch (error) {
      setState('error');
      const errorMsg = error instanceof Error ? error.message : 'Failed to save comparison';
      setErrorMessage(errorMsg);
      console.error('Error saving comparison:', error);
    }
  };

  /**
   * Render button content based on state
   */
  const renderButtonContent = () => {
    switch (state) {
      case 'loading':
        return (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Saving...</span>
          </>
        );

      case 'success':
        return (
          <>
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <span>Saved</span>
          </>
        );

      case 'exists':
        return (
          <>
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <span>Already Saved</span>
          </>
        );

      case 'error':
        return (
          <>
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
            <span>Save Failed - Retry</span>
          </>
        );

      default:
        return (
          <>
            <Bookmark className="w-5 h-5" aria-hidden="true" />
            <span>Save Comparison</span>
          </>
        );
    }
  };

  /**
   * Get button styling based on state
   */
  const getButtonClassName = () => {
    const baseClasses = 'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (state) {
      case 'success':
      case 'exists':
        return `${baseClasses} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500`;
      
      case 'error':
        return `${baseClasses} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`;
      
      default:
        return `${baseClasses} bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500`;
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={state === 'loading'}
        className={getButtonClassName()}
        aria-label="Save comparison"
      >
        {renderButtonContent()}
      </button>

      {/* Success Message with Link */}
      {(state === 'success' || state === 'exists') && savedComparisonId && (
        <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
              {state === 'success' ? 'Comparison saved successfully!' : 'This comparison was already saved.'}
            </p>
            <Link
              to={`/comparisons/results/${savedComparisonId}`}
              className="inline-flex items-center gap-1 mt-1 text-sm text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 underline"
            >
              View saved comparison
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}

      {/* Error Message */}
      {state === 'error' && errorMessage && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
              Failed to save comparison
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {errorMessage}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              Click the button above to retry.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveComparisonButton;

