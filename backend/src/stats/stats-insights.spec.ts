import {
  generateStatsInsights,
  monthBaselineLabel,
  monthlyScopeKey,
  previousMonth,
  yearBaselineLabel,
} from './stats-insights';

describe('generateStatsInsights', () => {
  const baseInput = {
    scopeKey: 'month:2025-06',
    periodMode: 'month' as const,
    year: 2025,
    month: 6,
    booksRead: 4,
    pagesRead: 1020,
    averageRating: 4,
    genreDistribution: [
      { genre: 'Fantasy', count: 2 },
      { genre: 'Sci-Fi', count: 1 },
      { genre: 'unknown', count: 1 },
    ],
    formatDistribution: [
      { format: 'Físico', count: 2 },
      { format: 'Ebook', count: 1 },
      { format: 'unknown', count: 1 },
    ],
    predominantFormat: 'Físico',
    previousBooksRead: 1,
    baselineLabel: 'Mayo 2025',
  };

  it('returns an empty array when there are no qualifying books', () => {
    expect(
      generateStatsInsights({
        ...baseInput,
        booksRead: 0,
        pagesRead: 0,
        averageRating: null,
      }),
    ).toEqual([]);
  });

  it('returns at least three insights when books were read', () => {
    const insights = generateStatsInsights(baseInput);
    expect(insights.length).toBeGreaterThanOrEqual(3);
  });

  it('includes a volume delta insight with percentage increase', () => {
    const insights = generateStatsInsights(baseInput);
    const volume = insights.find((insight) => insight.kind === 'volume_delta');
    expect(volume).toBeDefined();
    expect(volume?.body).toContain('+300');
    expect(volume?.data?.deltaPercent).toBe(300);
  });

  it('includes a dominant genre insight', () => {
    const insights = generateStatsInsights(baseInput);
    const genre = insights.find((insight) => insight.kind === 'genre_trend');
    expect(genre).toBeDefined();
    expect(genre?.body).toContain('Fantasy');
    expect(genre?.data?.dominantGenre).toBe('Fantasy');
  });

  it('uses stable ids for the same scope', () => {
    const first = generateStatsInsights(baseInput);
    const second = generateStatsInsights(baseInput);
    expect(first.map((insight) => insight.id)).toEqual(
      second.map((insight) => insight.id),
    );
  });
});

describe('previousMonth', () => {
  it('rolls January to December of the prior year', () => {
    expect(previousMonth(2026, 1)).toEqual({ year: 2025, month: 12 });
  });

  it('decrements within the same year', () => {
    expect(previousMonth(2025, 6)).toEqual({ year: 2025, month: 5 });
  });
});

describe('monthBaselineLabel', () => {
  it('formats Spanish month names', () => {
    expect(monthBaselineLabel(2025, 6)).toBe('Junio 2025');
  });
});

describe('yearBaselineLabel', () => {
  it('returns the year as a string', () => {
    expect(yearBaselineLabel(2024)).toBe('2024');
  });
});
