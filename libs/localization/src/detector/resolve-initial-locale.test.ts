import { resolveInitialLocale } from './resolve-initial-locale';

describe('resolveInitialLocale', () => {
  // @s3 — a supported device locale (including region-tagged) resolves to that language.
  it.each([
    ['pt', 'pt'],
    ['pt-BR', 'pt'],
    ['es-419', 'es'],
    ['de-AT', 'de'],
    ['en-US', 'en'],
  ])('resolves supported device tag "%s" to "%s"', (tag, expected) => {
    expect(resolveInitialLocale(tag)).toBe(expected);
  });

  // @s4 — an unsupported or absent device locale falls back to English.
  it.each([
    ['fr'],
    ['ja-JP'],
    ['zh-CN'],
    [''],
    [undefined],
    [null],
  ])('falls back to English for unsupported/absent tag "%s"', (tag) => {
    expect(resolveInitialLocale(tag as string | undefined | null)).toBe('en');
  });
});
