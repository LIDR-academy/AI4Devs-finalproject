/**
 * TextEditor Component Tests
 * Verifies text preservation (mirrors domain invariant)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextEditor } from '@/components/TextEditor';
import { useComposerStore } from '@/state/composerStore';

describe('TextEditor', () => {
  beforeEach(() => {
    // Reset store state before each test
    useComposerStore.setState({
      localText: '',
      textError: null,
    });
  });

  describe('Text Preservation', () => {
    it('should preserve text exactly as typed', async () => {
      const user = userEvent.setup();
      render(<TextEditor />);
      
      const textarea = screen.getByTestId('text-editor-textarea');
      await user.type(textarea, 'Hello World');
      
      expect(textarea).toHaveValue('Hello World');
    });

    it('should preserve special characters', async () => {
      const user = userEvent.setup();
      render(<TextEditor />);
      
      const textarea = screen.getByTestId('text-editor-textarea');
      const specialText = 'Breathe in... breathe out.\n\n🧘 Namaste!';
      
      await user.clear(textarea);
      await user.type(textarea, specialText);
      
      expect(textarea).toHaveValue(specialText);
    });

    it('should preserve whitespace and formatting', async () => {
      const user = userEvent.setup();
      render(<TextEditor />);
      
      const textarea = screen.getByTestId('text-editor-textarea');
      const formattedText = '   Indented text\n\nDouble spaced';
      
      await user.clear(textarea);
      await user.type(textarea, formattedText);
      
      expect(textarea).toHaveValue(formattedText);
    });
  });

  describe('Character Count', () => {
    it('should display character count', () => {
      useComposerStore.setState({ localText: 'Hello' });
      render(<TextEditor />);
      
      // Use regex to handle different locale number formats (10,000 vs 10.000)
      expect(screen.getByTestId('char-count')).toHaveTextContent(/5 \/ 10[,.]000 characters/);
    });

    it('should show warning when near limit', () => {
      // Set text to 90% of limit
      const nearLimitText = 'a'.repeat(9001);
      useComposerStore.setState({ localText: nearLimitText });
      render(<TextEditor />);
      
      const charCount = screen.getByTestId('char-count');
      expect(charCount).toHaveClass('text-editor__char-count--warning');
    });
  });

  describe('Disabled State', () => {
    it('should disable textarea when disabled prop is true', () => {
      render(<TextEditor disabled />);
      
      expect(screen.getByTestId('text-editor-textarea')).toBeDisabled();
    });

    it('should enable textarea by default', () => {
      render(<TextEditor />);
      
      expect(screen.getByTestId('text-editor-textarea')).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(<TextEditor />);
      
      expect(screen.getByLabelText('Meditation text')).toBeInTheDocument();
    });

    it('should show error with aria-invalid when over limit', () => {
      const overLimitText = 'a'.repeat(10001);
      useComposerStore.setState({ localText: overLimitText });
      render(<TextEditor />);
      
      expect(screen.getByTestId('text-editor-textarea')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Callback', () => {
    it('should call onTextChange when text changes', async () => {
      const user = userEvent.setup();
      const onTextChange = vi.fn();
      render(<TextEditor onTextChange={onTextChange} />);
      
      const textarea = screen.getByTestId('text-editor-textarea');
      await user.type(textarea, 'Test');
      
      expect(onTextChange).toHaveBeenCalled();
    });
  });
});
