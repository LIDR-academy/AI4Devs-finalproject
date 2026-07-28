import { GenreMatcherService } from './genre-matcher.service';

describe('GenreMatcherService', () => {
  const service = new GenreMatcherService();
  const userGenres = [
    { id: 'g-fantasy', name: 'Fantasía' },
    { id: 'g-scifi', name: 'Ciencia ficción' },
    { id: 'g-custom', name: 'Cocina' },
  ];

  it('matches exact genre names case-insensitively', () => {
    expect(service.match('fantasía', userGenres)).toEqual({
      status: 'matched',
      genre_id: 'g-fantasy',
      genre_name: 'Fantasía',
      raw_genre: 'fantasía',
    });
  });

  it('matches synonyms when user owns the canonical genre', () => {
    expect(service.match('Fantasy fiction', userGenres)).toEqual({
      status: 'matched',
      genre_id: 'g-fantasy',
      genre_name: 'Fantasía',
      raw_genre: 'Fantasy fiction',
    });
  });

  it('returns unresolved when no owned genre matches', () => {
    expect(service.match('Cooking', userGenres)).toEqual({
      status: 'unresolved',
      raw_genre: 'Cooking',
    });
  });

  it('returns empty for blank input', () => {
    expect(service.match('   ', userGenres)).toEqual({
      status: 'empty',
      raw_genre: null,
    });
  });

  it('deduplicates batch matches', () => {
    const results = service.matchMany(
      ['Fantasy fiction', 'Fantasy fiction', 'Cooking'],
      userGenres,
    );
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual(results[1]);
    expect(results[2].status).toBe('unresolved');
  });
});
