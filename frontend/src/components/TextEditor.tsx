/**
 * TextEditor Component
 * Capability 2: Define Meditation Text
 * 
 * Controlled textarea that preserves text exactly as typed.
 * Mirrors domain invariant: text is preserved exactly as provided.
 */

import { useCallback, type ChangeEvent } from 'react';
import { useComposerStore, useLocalText, useTextError } from '@/state/composerStore';

const MAX_TEXT_LENGTH = 10000;

interface TextEditorProps {
  disabled?: boolean;
  placeholder?: string;
  onTextChange?: (text: string) => void;
}

export function TextEditor({ 
  disabled = false, 
  placeholder = 'Enter your meditation text here...',
  onTextChange,
}: TextEditorProps) {
  const localText = useLocalText();
  const textError = useTextError();
  const setLocalText = useComposerStore((state) => state.setLocalText);
  
  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    // Preserve text exactly as typed - no transformation
    setLocalText(newText);
    onTextChange?.(newText);
  }, [setLocalText, onTextChange]);
  
  const charCount = localText.length;
  const isNearLimit = charCount > MAX_TEXT_LENGTH * 0.9;
  const isOverLimit = charCount > MAX_TEXT_LENGTH;
  
  return (
    <div className={`text-editor${textError ? ' text-editor--error' : ''}`} data-testid="text-editor">
      <textarea
        className="text-editor__textarea"
        value={localText}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={MAX_TEXT_LENGTH + 1} // Allow 1 extra to detect overflow
        aria-label="Meditation text"
        aria-describedby={textError ? 'text-error' : undefined}
        aria-invalid={isOverLimit || !!textError}
        data-testid="text-editor-textarea"
      />
      <div className="text-editor__footer">
        <span 
          className={`text-editor__char-count ${isNearLimit ? 'text-editor__char-count--warning' : ''}`}
          data-testid="char-count"
        >
          {charCount.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()} characters
        </span>
        {textError && (
          <span 
            id="text-error" 
            className="text-editor__error" 
            role="alert"
            data-testid="text-error"
          >
            {textError}
          </span>
        )}
      </div>
    </div>
  );
}

export default TextEditor;
