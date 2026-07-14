import { LessonImageService } from '@helsoft/supabase-services';
import type { SlideImageRef } from '@helsoft/types';
import { useEffect, useRef, useState } from 'react';

import type { UseSlideImageUrlResult } from './use-slide-image-url.types';

/**
 * Resolves a short-lived signed URL for a slide image ref. Returns `{ url: null }` when
 * the ref is absent or resolution fails — never throws.
 */
export const useSlideImageUrl = (imageRef?: SlideImageRef): UseSlideImageUrlResult => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(imageRef?.storagePath));
  const isMounted = useRef(true);
  const requestId = useRef(0);

  useEffect(
    () => () => {
      isMounted.current = false;
    },
    [],
  );

  useEffect(() => {
    if (!imageRef?.storagePath) {
      setUrl(null);
      setIsLoading(false);
      return;
    }

    const req = ++requestId.current;
    setIsLoading(true);
    setUrl(null);

    void LessonImageService.getSignedImageUrl(imageRef.storagePath).then((signed) => {
      if (req !== requestId.current || !isMounted.current) return;
      setUrl(signed);
      setIsLoading(false);
    });
  }, [imageRef?.storagePath]);

  return { url, isLoading };
};
