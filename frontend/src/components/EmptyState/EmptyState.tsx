'use client';

import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export const EmptyState = () => {
  const router = useRouter();
  const pathname = usePathname();

  const resetFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/5 border border-white/10 rounded-3xl w-full">
      <div className="p-4 bg-white/5 rounded-full mb-6 border border-white/10">
        <SearchX className="w-10 h-10 text-white/20" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">
        Sin hallazgos en esta frecuencia
      </h3>
      
      <p className="text-sm text-white/40 max-w-xs mb-8 leading-relaxed">
        "No encontramos obras que coincidan con tu tiempo y mood actual. Intenta ampliar el dial o cambiar el estado de ánimo."
      </p>

      <button
        onClick={resetFilters}
        className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
      >
        <RotateCcw size={14} /> Reiniciar Filtros
      </button>
    </div>
  );
};
