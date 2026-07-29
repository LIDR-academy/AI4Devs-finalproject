import { finalizeCovers, MAX_COVERS } from './cover-utils';

describe('finalizeCovers', () => {
  it('deduplicates by normalized URL', () => {
    const result = finalizeCovers([
      { id: '1', url: 'http://example.com/a.jpg', label: null },
      { id: '2', url: 'https://example.com/a.jpg', label: null },
    ]);
    expect(result.covers).toHaveLength(1);
    expect(result.covers[0].url).toBe('https://example.com/a.jpg');
  });

  it('caps at MAX_COVERS', () => {
    const raw = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      url: `https://example.com/${i}.jpg`,
      label: null,
    }));
    const result = finalizeCovers(raw);
    expect(result.covers).toHaveLength(MAX_COVERS);
  });

  it('uses hint_cover_url for default_cover_id', () => {
    const result = finalizeCovers(
      [
        { id: '1', url: 'https://covers.openlibrary.org/b/id/111-L.jpg', label: null },
        { id: '2', url: 'https://covers.openlibrary.org/b/id/222-L.jpg', label: null },
      ],
      'https://covers.openlibrary.org/b/id/222-L.jpg',
    );
    expect(result.default_cover_id).toBe('2');
  });

  it('returns empty covers and null default when input empty', () => {
    const result = finalizeCovers([]);
    expect(result.covers).toEqual([]);
    expect(result.default_cover_id).toBeNull();
  });
});
