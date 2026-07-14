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

  it('formats createdAt with the given locale', () => {
    const label = formatLessonCreatedDate('2026-07-13T12:00:00.000Z', 'en');
    expect(label).toMatch(/Jul(y)?\s*13,?\s*2026/);
  });

  it('builds list items with t()-resolved labels', () => {
    const t = (key: string, options?: Record<string, unknown>) => {
      if (key === 'home.createdDate') return `Created ${options?.date}`;
      if (key === 'home.openLesson') return `Open ${options?.title}`;
      return key;
    };

    const items = toLessonListItems(
      [{ id: '1', title: 'Capitals', createdAt: '2026-07-13T12:00:00.000Z' }],
      'en',
      t,
    );

    expect(items[0]?.openAccessibilityLabel).toBe('Open Capitals');
    expect(items[0]?.createdDateLabel).toMatch(/^Created /);
  });
});
