/**
 * AI Study Buddy — spacing & layout (MD3 4px base grid).
 */
export const spacing = {
  s0: 0,
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s8: 32,
  s10: 40,
  s12: 48,
  s14: 56,
  s16: 64,
  s20: 80,
  s24: 96,
} as const;

/** Component paddings (MD3 defaults). */
export const padding = {
  buttonX: 24,
  card: 16,
  dialog: 24,
  listItem: 16,
} as const;

export const layout = {
  gutter: 16,
  pageMargin: 24,
  contentMax: 1200,
  /** Readable lesson text column. */
  contentReading: 640,
  touchTarget: 48,
  iconSize: 24,
} as const;
