import { getMobileTitleKey } from './app-chrome.helpers';

describe('getMobileTitleKey', () => {
  it.each([
    ['/upload', 'nav.newLesson'],
    ['/settings', 'nav.settings'],
    ['/', 'nav.myLessons'],
  ])('returns the title key for %s', (pathname, expected) => {
    expect(getMobileTitleKey(pathname)).toBe(expected);
  });
});
