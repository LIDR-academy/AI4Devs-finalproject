import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type EstadoAcceso = 'ABIERTO' | 'SUSCRIPCION' | 'VOD';

interface AccesoIndicatorProps {
  estado: EstadoAcceso;
  className?: string;
}

const CONFIG = {
  ABIERTO: { color: 'bg-green-500', label: 'Abierto', shadow: 'shadow-green-500/50' },
  SUSCRIPCION: { color: 'bg-yellow-500', label: 'Suscripción', shadow: 'shadow-yellow-500/50' },
  VOD: { color: 'bg-blue-500', label: 'VOD', shadow: 'shadow-blue-500/50' },
};

export const AccesoIndicator = ({ estado, className }: AccesoIndicatorProps) => {
  const { color, label, shadow } = CONFIG[estado] || CONFIG.ABIERTO;

  return (
    <div className={cn("flex items-center gap-2 px-2 py-1 bg-white/5 rounded-full border border-white/10", className)}>
      <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px] animate-pulse", color, shadow)} />
      <span className="text-[10px] font-bold uppercase tracking-tighter text-white/70">
        {label}
      </span>
    </div>
  );
};
