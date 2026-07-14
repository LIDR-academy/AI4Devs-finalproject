jest.mock('@helsoft/hooks', () => ({
  useSlideImageUrl: jest.fn(),
}));

import { useSlideImageUrl } from '@helsoft/hooks';
import type { SlideImageRef } from '@helsoft/types';
import { render, screen } from '@testing-library/react-native';

import { SlideImage } from './slide-image';

const mockUseSlideImageUrl = useSlideImageUrl as jest.Mock;

const imageRef: SlideImageRef = {
  imageId: 'img-1',
  storagePath: 'user/doc/img.png',
  width: 400,
  height: 200,
  alt: 'Diagram of mitosis',
};

describe('SlideImage', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s8 — no url → render nothing (text-only slide).
  it('renders nothing when there is no url', async () => {
    mockUseSlideImageUrl.mockReturnValue({ url: null, isLoading: false });

    await render(<SlideImage image={undefined} />);

    expect(screen.queryByLabelText('Diagram of mitosis')).toBeNull();
  });

  // @s9 — image ref present but resolution failed → text-only, no error/placeholder.
  it('renders nothing when the image ref fails to resolve', async () => {
    mockUseSlideImageUrl.mockReturnValue({ url: null, isLoading: false });

    await render(<SlideImage image={imageRef} />);

    expect(screen.queryByLabelText('Diagram of mitosis')).toBeNull();
    expect(screen.queryByText(/error/i)).toBeNull();
    expect(screen.queryByRole('image')).toBeNull();
  });

  // @s7 — present image renders scaled with alt.
  it('renders the image scaled to fit when a url is available', async () => {
    mockUseSlideImageUrl.mockReturnValue({
      url: 'https://example.com/signed.png',
      isLoading: false,
    });

    await render(<SlideImage image={imageRef} />);

    const image = screen.getByLabelText('Diagram of mitosis');
    expect(image).toBeTruthy();
    expect(image.props.source).toEqual({ uri: 'https://example.com/signed.png' });
    expect(image.props.style).toEqual(
      expect.objectContaining({
        width: '100%',
        aspectRatio: 2,
      }),
    );
  });
});
