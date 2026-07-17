import {
  formatLessonCreatedDate,
  toLessonListItems,
  toLessonListState,
} from './saved-lessons.helpers';

describe('saved-lessons.helpers', () => {
  it('maps loading / error / empty / content states', () => {
    expect(toLessonListState(true, null, 0)).toBe('loading');
    expect(toLessonListState(false, new Error('x'), 0)).toBe('error');
    expect(toLessonListState(false, null, 0)).toBe('empty');
    expect(toLessonListState(false, null, 2)).toBe('content');
  });

  // Delete failure sets error but keeps lessons — must stay Content, not load-Error (@s8/@s14).
  it('keeps content when error is set but lessons remain', () => {
    expect(toLessonListState(false, new Error('delete failed'), 2)).toBe('content');
  });

  it('formats createdAt with the given locale', () => {
    const label = formatLessonCreatedDate('2026-07-13T12:00:00.000Z', 'en');
    expect(label).toMatch(/Jul(y)?\s*13,?\s*2026/);
  });

  // Mutation: NaN date guard → false — invalid ISO must return the raw string.
  it('returns the raw ISO string when createdAt is not a valid date', () => {
    expect(formatLessonCreatedDate('not-a-date', 'en')).toBe('not-a-date');
  });

  it('builds list items with t()-resolved labels', () => {
    const t = (key: string, options?: Record<string, unknown>) => {
      if (key === 'home.createdDate') return `Created ${options?.date}`;
      if (key === 'home.openLesson') return `Open ${options?.title}`;
      if (key === 'home.delete.action') return `Delete ${options?.title}`;
      return key;
    };

    const items = toLessonListItems(
      [{ id: '1', title: 'Capitals', createdAt: '2026-07-13T12:00:00.000Z' }],
      'en',
      t,
    );

    expect(items[0]?.openAccessibilityLabel).toBe('Open Capitals');
    expect(items[0]?.deleteAccessibilityLabel).toBe('Delete Capitals');
    expect(items[0]?.createdDateLabel).toMatch(/^Created /);
  });
});
