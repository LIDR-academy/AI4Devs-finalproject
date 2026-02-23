import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImagePreview from '@/components/ImagePreview';

describe('ImagePreview (AI base64)', () => {
  it('should display a base64 data URL image', () => {
    const dataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA\nAAAAFCAIAAAACDbGyAAAAHElEQVQI12P4//8/w38GIAXDIBKE0dhZglkAAAABJRU5ErkJggg==';
    render(<ImagePreview previewUrl={dataUrl} imageName="AI Image" />);
    const img = screen.getByTestId('image-preview-img');
    expect(img).toHaveAttribute('src', dataUrl);
    expect(img).toHaveAttribute('alt', 'AI Image');
  });
});
