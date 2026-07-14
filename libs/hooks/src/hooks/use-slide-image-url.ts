import { LessonImageService } from '@helsoft/supabase-services';
import type { SlideImageRef } from '@helsoft/types';
import { useEffect, useRef, useState } from 'react';

import { nextRequestId } from './next-request-id';
import type { UseSlideImageUrlResult } from './use-slide-image-url.types';

/**
 * Resolves a short-lived signed URL for a slide image ref. Returns `{ url: null }` when
 * the ref is absent or resolution fails — never throws.
 */
export const useSlideImageUrl = (imageRef?: SlideImageRef): UseSlideImageUrlResult => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(imageRef?.storagePath));
  const requestId = useRef(0);

  useEffect(() => {
    if (!imageRef?.storagePath) {
      setUrl(null);
      setIsLoading(false);
      return;
    }

    const req = nextRequestId(requestId.current);
    requestId.current = req;
    setIsLoading(true);
    setUrl(null);

    void LessonImageService.getSignedImageUrl(imageRef.storagePath).then((signed) => {
      if (req !== requestId.current) return;
      setUrl(signed);
      setIsLoading(false);
    });
  }, [imageRef?.storagePath]);

  return { url, isLoading };
};
