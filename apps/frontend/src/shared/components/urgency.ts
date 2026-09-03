export type UrgencyLevel = 'critical' | 'warning' | 'safe';

/**
 * Deriva nivel + etiqueta de urgencia FEFO desde las horas restantes, sin cortar
 * la escala: `Hoy` (<24h) · `Mañana` (<48h) · `N Días` (resto, `Math.ceil(h/24)`).
 * Vive fuera de `UrgencyChip.tsx` para no romper Fast Refresh (react-refresh/only-export-components).
 */
export function urgencyFromHours(hoursRemaining: number): { level: UrgencyLevel; label: string } {
  if (hoursRemaining < 24) return { level: 'critical', label: 'Hoy' };
  if (hoursRemaining < 48) return { level: 'warning', label: 'Mañana' };
  return { level: 'safe', label: `${Math.ceil(hoursRemaining / 24)} Días` };
}
