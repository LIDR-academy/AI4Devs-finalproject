import type { StatsInsightDto, StatsInsightKind } from './dto/stats-insight.dto';

export interface InsightGenerationInput {
  scopeKey: string;
  periodMode: 'month' | 'year';
  year: number;
  month?: number;
  booksRead: number;
  pagesRead: number;
  averageRating: number | null;
  genreDistribution: Array<{ genre: string; count: number }>;
  formatDistribution: Array<{ format: string; count: number }>;
  predominantFormat: string | null;
  previousBooksRead: number;
  baselineLabel: string;
}

const FORMAT_LABELS: Record<string, string> = {
  fisico: 'físico',
  ebook: 'ebook',
  audio: 'audio',
  unknown: 'sin formato',
};

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function insightId(kind: StatsInsightKind, scopeKey: string): string {
  const seed = `${kind}:${scopeKey}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hex = hash.toString(16).padStart(8, '0');
  return `00000000-0000-4000-8000-${hex.padStart(12, '0').slice(0, 12)}`;
}

function formatPercent(value: number): string {
  return value.toLocaleString('es-ES', {
    maximumFractionDigits: 1,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  });
}

function share(count: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((count / total) * 1000) / 1000;
}

function genreLabel(genre: string): string {
  return genre === 'unknown' ? 'sin género definido' : genre;
}

function formatLabel(format: string): string {
  return FORMAT_LABELS[format] ?? format;
}

/** Spanish unit noun for the active stats filter (`mes` / `año`). */
export function periodUnitLabel(periodMode: 'month' | 'year'): string {
  return periodMode === 'year' ? 'año' : 'mes';
}

function buildVolumeDeltaInsight(
  input: InsightGenerationInput,
): StatsInsightDto {
  const { booksRead, previousBooksRead, baselineLabel } = input;
  const unit = periodUnitLabel(input.periodMode);
  const deltaPercent =
    previousBooksRead === 0
      ? booksRead > 0
        ? 100
        : 0
      : Math.round(
          ((booksRead - previousBooksRead) / previousBooksRead) * 1000,
        ) / 10;

  let title: string;
  let body: string;

  if (booksRead > previousBooksRead) {
    title = `Subiste el ritmo respecto al ${unit} anterior`;
    body = `Este ${unit} cerraste ${booksRead} libros frente a ${previousBooksRead} en ${baselineLabel}: un +${formatPercent(deltaPercent)} % de volumen.`;
  } else if (booksRead < previousBooksRead) {
    title = `Ritmo más pausado que el ${unit} anterior`;
    body = `Este ${unit} cerraste ${booksRead} libros frente a ${previousBooksRead} en ${baselineLabel}: un ${formatPercent(deltaPercent)} % de volumen.`;
  } else {
    title = `Mismo volumen que el ${unit} anterior`;
    body = `Cerraste ${booksRead} libros, igual que en ${baselineLabel}.`;
  }

  return {
    id: insightId('volume_delta', input.scopeKey),
    kind: 'volume_delta',
    title,
    body,
    data: {
      currentCount: booksRead,
      previousCount: previousBooksRead,
      deltaPercent,
      baselineLabel,
      comparisonPeriod: input.periodMode,
    },
  };
}

function buildGenreTrendInsight(
  input: InsightGenerationInput,
): StatsInsightDto | null {
  const top = input.genreDistribution[0];
  if (!top || top.count <= 0) {
    return null;
  }

  const genreShare = share(top.count, input.booksRead);
  const label = genreLabel(top.genre);
  const percent = formatPercent(genreShare * 100);

  return {
    id: insightId('genre_trend', input.scopeKey),
    kind: 'genre_trend',
    title:
      top.genre === 'unknown'
        ? 'Lecturas sin género dominante claro'
        : `${label} marca el periodo`,
    body: `${top.count} de ${input.booksRead} lecturas (${percent} %) fueron ${label}: es tu tendencia principal del ${periodUnitLabel(input.periodMode)}.`,
    data: {
      dominantGenre: top.genre,
      count: top.count,
      share: genreShare,
    },
  };
}

function buildFormatMixInsight(
  input: InsightGenerationInput,
): StatsInsightDto | null {
  const knownFormats = input.formatDistribution.filter(
    (entry) => entry.format !== 'unknown' && entry.count > 0,
  );
  if (knownFormats.length === 0) {
    return null;
  }

  const top = knownFormats[0];
  const topShare = share(top.count, input.booksRead);
  const predominant = input.predominantFormat ?? top.format;

  return {
    id: insightId('format_mix', input.scopeKey),
    kind: 'format_mix',
    title: `Predominio ${formatLabel(predominant)}`,
    body: `El ${formatPercent(topShare * 100)} % de tus lecturas fueron en ${formatLabel(top.format)}.`,
    data: {
      predominantReadFormat: predominant,
      topFormat: top.format,
      share: topShare,
    },
  };
}

function buildPagesMilestoneInsight(
  input: InsightGenerationInput,
): StatsInsightDto | null {
  if (input.pagesRead <= 0) {
    return null;
  }

  return {
    id: insightId('pages_milestone', input.scopeKey),
    kind: 'pages_milestone',
    title: 'Hito de páginas',
    body: `Acumulaste ${input.pagesRead.toLocaleString('es-ES')} páginas leídas en este ${periodUnitLabel(input.periodMode)}.`,
    data: {
      pagesRead: input.pagesRead,
    },
  };
}

function buildRatingPatternInsight(
  input: InsightGenerationInput,
): StatsInsightDto | null {
  if (input.averageRating === null) {
    return null;
  }

  return {
    id: insightId('rating_pattern', input.scopeKey),
    kind: 'rating_pattern',
    title: `Valoración media del ${periodUnitLabel(input.periodMode)}`,
    body: `Tu valoración media fue de ${formatPercent(input.averageRating)} sobre 5 en las lecturas puntuadas.`,
    data: {
      averageRating: input.averageRating,
    },
  };
}

export function generateStatsInsights(
  input: InsightGenerationInput,
): StatsInsightDto[] {
  if (input.booksRead <= 0) {
    return [];
  }

  const candidates: Array<StatsInsightDto | null> = [
    buildVolumeDeltaInsight(input),
    buildGenreTrendInsight(input),
    buildFormatMixInsight(input),
    buildPagesMilestoneInsight(input),
    buildRatingPatternInsight(input),
  ];

  const insights = candidates.filter(
    (insight): insight is StatsInsightDto => insight !== null,
  );

  while (insights.length < 3) {
    insights.push({
      id: insightId('other', `${input.scopeKey}:${insights.length}`),
      kind: 'other',
      title: 'Sigue explorando tus estadísticas',
      body: `Tienes ${input.booksRead} lecturas registradas en este ${periodUnitLabel(input.periodMode)}. Cambia el filtro para comparar otros meses o años.`,
      data: {
        booksRead: input.booksRead,
      },
    });
  }

  return insights.slice(0, 5);
}

export function previousMonth(
  year: number,
  month: number,
): { year: number; month: number } {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
}

export function monthBaselineLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function yearBaselineLabel(year: number): string {
  return String(year);
}

export function monthlyScopeKey(year: number, month: number): string {
  return `month:${year}-${String(month).padStart(2, '0')}`;
}

export function yearlyScopeKey(year: number): string {
  return `year:${year}`;
}
