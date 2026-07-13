import {
  GENERATION_ERROR_KEYS,
  GENERATION_ERROR_RECOVERY,
  isLessonComposition,
  toPanelState,
} from './lesson-generation.helpers';

describe('isLessonComposition', () => {
  it('accepts every LessonComposition value', () => {
    expect(isLessonComposition('instructional-only')).toBe(true);
    expect(isLessonComposition('activity-only')).toBe(true);
    expect(isLessonComposition('both')).toBe(true);
  });

  it('rejects any other string', () => {
    expect(isLessonComposition('everything')).toBe(false);
  });
});

describe('toPanelState', () => {
  // @s14 — the hook's 'generating' stage drives the panel's Loading state.
  it('maps generating to loading', () => {
    expect(toPanelState('generating')).toBe('loading');
  });

  // @s17 — the hook's 'content' stage drives the panel's Content state.
  it('maps content to content', () => {
    expect(toPanelState('content')).toBe('content');
  });

  // @s16 — idle (no generation yet) drives the panel's Empty state.
  it('maps idle to empty', () => {
    expect(toPanelState('idle')).toBe('empty');
  });

  // @s15 (task-13) — the hook's 'error' stage now drives the panel's own Error state.
  it('maps error to error', () => {
    expect(toPanelState('error')).toBe('error');
  });
});

describe('GENERATION_ERROR_KEYS (task-13)', () => {
  // @s15/@s18 — every GenerationErrorCode maps to its own i18n message key (spec.md's Error
  // contract table names these keys verbatim), so a missing mapping fails to compile.
  it('maps every GenerationErrorCode to its spec.md i18n key', () => {
    expect(GENERATION_ERROR_KEYS).toEqual({
      missing_key: 'generation.error.missingKey',
      invalid_key: 'generation.error.invalidKey',
      rate_limited: 'generation.error.rateLimited',
      timeout: 'generation.error.timeout',
      generation_failed: 'generation.error.generationFailed',
      document_not_ready: 'generation.error.documentNotReady',
      network_error: 'generation.error.network',
      unauthenticated: 'generation.error.unauthenticated',
    });
  });
});

describe('GENERATION_ERROR_RECOVERY (task-13)', () => {
  // @s15 — recovery per code (task-13.md's "Recovery per code" table).
  it('maps each code to its recovery-affordance category', () => {
    expect(GENERATION_ERROR_RECOVERY).toEqual({
      missing_key: 'settings',
      invalid_key: 'settings',
      rate_limited: 'retry',
      timeout: 'retry',
      generation_failed: 'retry',
      document_not_ready: 'none',
      network_error: 'retry',
      unauthenticated: 'signIn',
    });
  });
});
