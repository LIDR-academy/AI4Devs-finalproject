'use client';

import { Clock } from 'lucide-react';
import { isExpiringSoon, formatExpiryDate } from '@/lib/utils';

interface ChatExpiryBannerProps {
  expiresAtUnix: number | undefined;
}

export function ChatExpiryBanner({ expiresAtUnix }: ChatExpiryBannerProps) {
  if (expiresAtUnix === undefined || !isExpiringSoon(expiresAtUnix)) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-10 flex items-center gap-2 bg-brand-lime px-4 py-2.5 text-sm font-medium text-brand-black"
    >
      <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        Los mensajes de esta conversación expiran el{' '}
        <strong>{formatExpiryDate(expiresAtUnix)}</strong>. Después no estarán
        disponibles.
      </span>
    </div>
  );
}
