/**
 * AI Study Buddy — shape (MD3 corner radius scale).
 */
export const shape = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 28,
  /** Pill / fully-rounded. */
  full: 999,

  // Component defaults
  button: 999,
  card: 12,
  dialog: 28,
  /** Filled field top corners. */
  textField: 4,
  chip: 8,
  fab: 16,
  sheet: 28,
} as const;
