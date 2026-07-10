import { toBaseSubtag } from './device-locale';

describe('toBaseSubtag', () => {
  it.each([
    ['pt-BR', 'pt'],
    ['de-AT', 'de'],
    ['es-419', 'es'],
    ['en-US', 'en'],
    ['pt', 'pt'],
    ['EN', 'en'],
  ])('normalizes "%s" to its base language subtag "%s"', (tag, base) => {
    expect(toBaseSubtag(tag)).toBe(base);
  });
});
