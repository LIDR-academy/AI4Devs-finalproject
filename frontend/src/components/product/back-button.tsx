'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
    >
      <ChevronLeft className="w-4 h-4" />
      Volver
    </button>
  );
}
