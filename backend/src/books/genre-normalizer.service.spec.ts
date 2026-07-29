import { GenreNormalizerService } from './genre-normalizer.service';

describe('GenreNormalizerService', () => {
  const service = new GenreNormalizerService();

  it.each([
    ['Fantasy fiction, American', 'Fantasía'],
    ['science fiction -- novela', 'Ciencia ficción'],
    ['Crime fiction / suspense', 'Thriller'],
    ['Romantic fiction', 'Romance'],
    ['Historical fiction', 'Histórica'],
    ['Literary fiction', 'Ficción'],
    ['Non-fiction biography', 'No ficción'],
    ['Fiction, romance, general', 'Romance'],
    ['Magic and Supernatural', 'Fantasía'],
    ['Human cloning', 'Ciencia ficción'],
    ['Guerra nuclear', 'No ficción'],
    ['Young adult fiction', 'Ficción'],
    ['Domestic thriller', 'Thriller'],
  ])('normalizes "%s" into "%s"', (input, expected) => {
    expect(service.normalize(input)).toBe(expected);
  });

  it('returns null for unknown categories', () => {
    expect(service.normalize('Cooking')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(service.normalize('  ')).toBeNull();
    expect(service.normalize(null)).toBeNull();
  });
});
