'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DURACIONES = [5, 10, 15, 30, 45, 60, 90, 120];

export const DialDeTiempo = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Buscar el índice inicial basado en el query param
  const initialValue = Number(searchParams.get('duracion_max')) || 0;

  // Si es 999 o mayor, es el índice 7 (120+)
  // Si no hay valor, por defecto usamos 30 (índice 3)
  const getInitialIndex = () => {
    if (initialValue >= 120) return 7;
    if (initialValue <= 0) return 3;
    const found = DURACIONES.findIndex((v) => v >= initialValue);
    return found !== -1 ? found : 3;
  };

  const [index, setIndex] = useState(getInitialIndex());

  const value = DURACIONES[index];

  // Actualizar URL con debounce manual (aquí simulado por la interacción)
  const updateUrl = useCallback(
    (val: number) => {
      const params = new URLSearchParams(searchParams);
      // Si el valor es el máximo (120), enviamos un valor alto (999) para el backend
      if (val) {
        params.set('duracion_max', (val === 120 ? 999 : val).toString());
      } else {
        params.delete('duracion_max');
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(e.target.value);
    setIndex(newIndex);
    updateUrl(DURACIONES[newIndex]);
  };

  const formatText = (min: number) => {
    if (min < 60) return `${min} min`;
    if (min === 60) return `1 hora`;
    if (min === 120) return `2+ horas`;
    return `${Math.floor(min / 60)}h ${min % 60}m`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 px-16 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden group max-w-2xl mx-auto w-full">
      {/* Label & Icon */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-cyan-500/10 rounded-full border border-cyan-500/20">
          <Clock className="w-4 h-4 text-cyan-400" />
        </div>
        <h3 className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/50">Dial de Tiempo</h3>
      </div>

      <div className="relative w-full flex flex-col items-center">
        {/* Value Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -5, opacity: 0 }}
            className="text-5xl font-light text-white mb-2 tabular-nums tracking-[0.05em]"
          >
            {formatText(value)}
          </motion.div>
        </AnimatePresence>

        <p className="text-[9px] text-white/20 mb-6 font-bold tracking-[0.2em] uppercase">
          "Contenido seleccionado"
        </p>

        {/* Custom Slider Segment */}
        <div className="relative w-full h-1 bg-white/5 rounded-full mb-4">
          <div
            className="absolute h-full bg-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${(index / (DURACIONES.length - 1)) * 100}%` }}
          />
          <input
            type="range"
            min="0"
            max={DURACIONES.length - 1}
            step="1"
            value={index}
            onChange={handleChange}
            className="absolute inset-x-0 -top-4 bottom-0 w-full h-10 opacity-0 cursor-pointer z-10"
          />

          {/* Ticks */}
          <div className="absolute inset-0 flex justify-between items-center pointer-events-none px-0.5">
            {DURACIONES.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 h-1 rounded-full transition-all duration-500",
                  i <= index ? "bg-cyan-400 scale-125 shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "bg-white/10"
                )}
              />
            ))}
          </div>

          {/* Thumb Indicator (Visual only) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-500 rounded-full border-2 border-zinc-900 shadow-[0_0_15px_rgba(34,211,238,0.6)] transition-all duration-300 pointer-events-none"
            style={{ left: `calc(${(index / (DURACIONES.length - 1)) * 100}% - 8px)` }}
          />
        </div>

        {/* Labels below slider */}
        <div className="flex justify-between w-full opacity-20">
          <span className="text-[8px] font-bold tracking-widest uppercase">Cortos</span>
          <span className="text-[8px] font-bold tracking-widest uppercase">Largo</span>
        </div>
      </div>
    </div>
  );
};
