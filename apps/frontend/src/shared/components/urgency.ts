export type UrgencyLevel = 'critical' | 'warning' | 'safe';

/**
 * Deriva nivel + etiqueta de urgencia FEFO desde las horas restantes, sin cortar
 * la escala: `Vencido` (<0h) · `Hoy` (<24h) · `Mañana` (<48h) · `N Días` (resto).
 * Vive fuera de `UrgencyChip.tsx` para no romper Fast Refresh (react-refresh/only-export-components).
 * "Vencido" añadido en `TK-087-FE` (hallazgo D-3 de `AUDIT-DEV-004`).
 */
export function urgencyFromHours(hoursRemaining: number): { level: UrgencyLevel; label: string } {
  if (hoursRemaining < 0) return { level: 'critical', label: 'Vencido' };
  if (hoursRemaining < 24) return { level: 'critical', label: 'Hoy' };
  if (hoursRemaining < 48) return { level: 'warning', label: 'Mañana' };
  return { level: 'safe', label: `${Math.ceil(hoursRemaining / 24)} Días` };
}

export interface FefoBuckets {
  critical: number;
  warning: number;
  safe: number;
  total: number;
}

/**
 * Segmenta un conjunto de remanentes en las 3 cubetas de severidad FEFO, usando el
 * MISMO umbral que `urgencyFromHours` — única fuente de verdad compartida por la
 * `FEFOInventoryHealthBar`, el panel Estado y los chips de fila (`TK-087-FE`).
 */
export function bucketRemanentes(items: readonly { hoursRemaining: number }[]): FefoBuckets {
  const buckets: FefoBuckets = { critical: 0, warning: 0, safe: 0, total: items.length };
  for (const item of items) {
    buckets[urgencyFromHours(item.hoursRemaining).level] += 1;
  }
  return buckets;
}

export interface FefoPercentages {
  safePct: number;
  warningPct: number;
  criticalPct: number;
}

/**
 * Porcentajes redondeados que SIEMPRE suman 100: el residuo de redondeo (±1-2) se
 * absorbe en el segmento con mayor conteo (AC #2 de `TK-087-FE`).
 */
export function bucketPercentages(buckets: FefoBuckets): FefoPercentages {
  if (buckets.total === 0) return { safePct: 0, warningPct: 0, criticalPct: 0 };

  const pct: FefoPercentages = {
    safePct: Math.round((buckets.safe / buckets.total) * 100),
    warningPct: Math.round((buckets.warning / buckets.total) * 100),
    criticalPct: Math.round((buckets.critical / buckets.total) * 100),
  };

  const residue = 100 - (pct.safePct + pct.warningPct + pct.criticalPct);
  const largest: keyof FefoPercentages =
    buckets.safe >= buckets.warning && buckets.safe >= buckets.critical
      ? 'safePct'
      : buckets.warning >= buckets.critical
        ? 'warningPct'
        : 'criticalPct';
  pct[largest] += residue;
  return pct;
}
