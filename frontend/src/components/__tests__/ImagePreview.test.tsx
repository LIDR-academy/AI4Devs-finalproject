/**
 * ImagePreview Component Tests
 * Verifies display logic (SC-007: preview within 1 second)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImagePreview } from '@/components/ImagePreview';
import { useComposerStore } from '@/state/composerStore';

describe('ImagePreview', () => {
  beforeEach(() => {
    useComposerStore.setState({
      selectedImageId: null,
    });
  });

  describe('No Image Selected', () => {
    it('should show empty state when no image', () => {
      render(<ImagePreview />);
      
      expect(screen.getByTestId('image-preview-empty')).toBeInTheDocument();
      expect(screen.getByText('No image selected')).toBeInTheDocument();
    });

    it('should show hint text', () => {
      render(<ImagePreview />);
      
      expect(screen.getByText('Select an image or generate one with AI')).toBeInTheDocument();
    });
  });

  describe('Image Selected', () => {
    beforeEach(() => {
      useComposerStore.setState({ selectedImageId: 'sunset-beach-001' });
    });

    it('should show image when preview URL provided', () => {
      render(<ImagePreview previewUrl="https://example.com/image.jpg" imageName="Sunset Beach" />);
      
      const img = screen.getByTestId('image-preview-img');
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(img).toHaveAttribute('alt', 'Sunset Beach');
    });

    it('should show placeholder when no preview URL', () => {
      render(<ImagePreview imageName="Sunset Beach" />);
      
      expect(screen.getByTestId('image-preview-placeholder')).toBeInTheDocument();
      expect(screen.getByText('Sunset Beach')).toBeInTheDocument();
    });

    it('should show remove button', () => {
      render(<ImagePreview previewUrl="https://example.com/image.jpg" />);
      
      const removeButton = screen.getByTestId('image-remove-button');
      expect(removeButton).toBeInTheDocument();
      expect(removeButton).toHaveTextContent(/Remove Image/);
    });
  });

  describe('Remove Image', () => {
    beforeEach(() => {
      useComposerStore.setState({ selectedImageId: 'sunset-beach-001' });
    });

    it('should clear image on remove click', async () => {
      const user = userEvent.setup();
      render(<ImagePreview previewUrl="https://example.com/image.jpg" />);
      
      await user.click(screen.getByTestId('image-remove-button'));
      
      expect(useComposerStore.getState().selectedImageId).toBeNull();
    });

    it('should call onRemove callback', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      render(<ImagePreview previewUrl="https://example.com/image.jpg" onRemove={onRemove} />);
      
      await user.click(screen.getByTestId('image-remove-button'));
      
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('should update output type when image removed', async () => {
      const user = userEvent.setup();
      useComposerStore.setState({ outputType: 'VIDEO' });
      render(<ImagePreview previewUrl="https://example.com/image.jpg" />);
      
      await user.click(screen.getByTestId('image-remove-button'));
      
      expect(useComposerStore.getState().outputType).toBe('PODCAST');
    });
  });

  describe('Disabled State', () => {
    beforeEach(() => {
      useComposerStore.setState({ selectedImageId: 'sunset-beach-001' });
    });

    it('should disable remove button when disabled', () => {
      render(<ImagePreview previewUrl="https://example.com/image.jpg" disabled />);
      
      expect(screen.getByTestId('image-remove-button')).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      useComposerStore.setState({ selectedImageId: 'sunset-beach-001' });
    });

    it('should have accessible remove button label', () => {
      render(<ImagePreview previewUrl="https://example.com/image.jpg" />);
      
      expect(screen.getByLabelText('Remove image')).toBeInTheDocument();
    });

    it('should use eager loading for fast display', () => {
      render(<ImagePreview previewUrl="https://example.com/image.jpg" />);
      
      expect(screen.getByTestId('image-preview-img')).toHaveAttribute('loading', 'eager');
    });
  });
});
