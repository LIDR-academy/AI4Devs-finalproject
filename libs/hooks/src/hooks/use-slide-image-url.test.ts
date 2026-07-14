jest.mock('@helsoft/supabase-services', () => ({
  LessonImageService: { getSignedImageUrl: jest.fn() },
}));

import { LessonImageService } from '@helsoft/supabase-services';
import type { SlideImageRef } from '@helsoft/types';
import { renderHook, waitFor } from '@testing-library/react';

import { useSlideImageUrl } from './use-slide-image-url';

const service = LessonImageService as jest.Mocked<typeof LessonImageService>;

const imageRef: SlideImageRef = {
  imageId: 'img-1',
  storagePath: 'user/doc/img.png',
  width: 400,
  height: 300,
  alt: 'A diagram',
};

describe('useSlideImageUrl', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s8 — absent image ref → url null, not loading.
  it('returns url null and isLoading false when imageRef is absent', () => {
    const { result } = renderHook(() => useSlideImageUrl(undefined));

    expect(result.current.url).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(service.getSignedImageUrl).not.toHaveBeenCalled();
  });

  // @s7 — resolves a usable URL.
  it('resolves the signed URL from LessonImageService', async () => {
    service.getSignedImageUrl.mockResolvedValue('https://example.com/signed.png');
    const { result } = renderHook(() => useSlideImageUrl(imageRef));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(service.getSignedImageUrl).toHaveBeenCalledWith('user/doc/img.png');
    expect(result.current.url).toBe('https://example.com/signed.png');
  });

  // @s9 feed — failure degrades to null.
  it('returns url null when the service resolves null', async () => {
    service.getSignedImageUrl.mockResolvedValue(null);
    const { result } = renderHook(() => useSlideImageUrl(imageRef));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.url).toBeNull();
  });
});
