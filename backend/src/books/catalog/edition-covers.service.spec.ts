import { EditionCoversService } from './edition-covers.service';
import { OpenLibraryCoversService } from './open-library-covers.service';
import { GoogleBooksCoversService } from './google-books-covers.service';

describe('EditionCoversService', () => {
  const olCovers = {
    getCovers: jest.fn(),
  };
  const gbCovers = {
    getCovers: jest.fn(),
  };
  let service: EditionCoversService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EditionCoversService(
      olCovers as unknown as OpenLibraryCoversService,
      gbCovers as unknown as GoogleBooksCoversService,
    );
  });

  it('delegates to Open Library for open_library source', async () => {
    olCovers.getCovers.mockResolvedValue([
      { id: '1', url: 'https://covers.openlibrary.org/b/id/1-L.jpg', label: 'A' },
    ]);

    const result = await service.getCovers(
      'open_library',
      '/works/OL82563W',
    );

    expect(olCovers.getCovers).toHaveBeenCalledWith('/works/OL82563W');
    expect(gbCovers.getCovers).not.toHaveBeenCalled();
    expect(result.covers).toHaveLength(1);
  });

  it('delegates to Google Books for google_books source', async () => {
    gbCovers.getCovers.mockResolvedValue([
      { id: 'vol-thumb', url: 'https://books.google.com/thumb.jpg', label: 'Pequeña' },
    ]);

    const result = await service.getCovers('google_books', 'abc123');

    expect(gbCovers.getCovers).toHaveBeenCalledWith('abc123');
    expect(result.covers).toHaveLength(1);
  });

  it('prepends hint cover when not in list', async () => {
    olCovers.getCovers.mockResolvedValue([]);
    const hint = 'https://covers.openlibrary.org/b/id/99-L.jpg';

    const result = await service.getCovers(
      'open_library',
      '/works/OL1W',
      hint,
    );

    expect(result.covers[0].url).toBe(hint);
    expect(result.default_cover_id).toBe('99');
  });
});
