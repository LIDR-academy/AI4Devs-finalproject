import { isLessonComposition, toPanelState } from './lesson-generation.helpers';

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

  // Slice-1 scope: the panel has no Error state yet (task-13 adds it) — error falls back to
  // empty rather than crashing on an unhandled state.
  it('falls back error to empty (Slice-1 scope; task-13 adds the Error state)', () => {
    expect(toPanelState('error')).toBe('empty');
  });
});
