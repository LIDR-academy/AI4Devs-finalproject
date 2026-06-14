export function buildImageUrl(image: string): string {
  const base = process.env.NEXT_PUBLIC_ASSETS_BASE_URL ?? '/images';
  return `${base}/${image}`;
}

export const VALID_DISTANCES = ['5K', '10K', 'half-marathon', 'marathon', 'ultra'] as const;
export const VALID_SURFACES = ['road', 'trail', 'track', 'mixed'] as const;
export const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export const VALID_OBJECTIVES = ['training', 'competition', 'recovery', 'daily'] as const;

export const LEVEL_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  beginner: {
    label: 'Principiante',
    bg: 'bg-rm-level-beginner-bg',
    text: 'text-rm-level-beginner-text',
  },
  intermediate: {
    label: 'Popular',
    bg: 'bg-rm-level-intermediate-bg',
    text: 'text-rm-level-intermediate-text',
  },
  advanced: {
    label: 'Avanzado',
    bg: 'bg-rm-level-advanced-bg',
    text: 'text-rm-level-advanced-text',
  },
};

export const DISTANCE_LABELS: Record<string, string> = {
  '5K': '5K',
  '10K': '10K',
  'half-marathon': 'Media Maratón',
  marathon: 'Maratón',
  ultra: 'Ultra',
};

export const SURFACE_LABELS: Record<string, string> = {
  road: 'Asfalto',
  trail: 'Trail',
  track: 'Pista',
  mixed: 'Mixto',
};

export const OBJECTIVE_LABELS: Record<string, string> = {
  training: 'Entrenamiento',
  competition: 'Competición',
  recovery: 'Recuperación',
  daily: 'Uso diario',
};

export const COLOR_LABELS: Record<string, string> = {
  black: 'Negro',
  white: 'Blanco',
  blue: 'Azul',
  red: 'Rojo',
  grey: 'Gris',
  green: 'Verde',
  pink: 'Rosa',
  navy: 'Marino',
  orange: 'Naranja',
  glacier: 'Glaciar',
};

export const CATEGORY_LABELS: Record<string, string> = {
  shoes: 'Zapatillas',
  clothing: 'Ropa',
  accessories: 'Accesorios',
};

export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  processing: {
    label: 'En proceso',
    bg: 'bg-rm-status-processing-bg',
    text: 'text-rm-status-processing-text',
  },
  shipped: {
    label: 'Enviado',
    bg: 'bg-rm-status-shipped-bg',
    text: 'text-rm-status-shipped-text',
  },
  delivered: {
    label: 'Entregado',
    bg: 'bg-rm-status-delivered-bg',
    text: 'text-rm-status-delivered-text',
  },
  cancelled: {
    label: 'Cancelado',
    bg: 'bg-rm-status-cancelled-bg',
    text: 'text-rm-status-cancelled-text',
  },
};
