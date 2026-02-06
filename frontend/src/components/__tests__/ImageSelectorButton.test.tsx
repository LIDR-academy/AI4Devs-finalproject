import { render, fireEvent } from '@testing-library/react';
import ImageSelectorButton from '../ImageSelectorButton';

describe('ImageSelectorButton', () => {
  it('calls onImageSelected with the selected file', () => {
    const onImageSelected = jest.fn();
    const { getByText, container } = render(
      <ImageSelectorButton onImageSelected={onImageSelected} />
    );
    const button = getByText(/seleccionar imagen/i);
    fireEvent.click(button);
    const input = container.querySelector('input[type="file"]')!;
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onImageSelected).toHaveBeenCalledWith(file);
  });

  it('does not call onImageSelected if file is not an image', () => {
    const onImageSelected = jest.fn();
    const { getByText, container } = render(
      <ImageSelectorButton onImageSelected={onImageSelected} />
    );
    const button = getByText(/seleccionar imagen/i);
    fireEvent.click(button);
    const input = container.querySelector('input[type="file"]')!;
    const file = new File(['dummy'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onImageSelected).not.toHaveBeenCalled();
  });
});
