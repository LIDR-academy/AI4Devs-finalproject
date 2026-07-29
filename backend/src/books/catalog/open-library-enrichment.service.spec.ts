import { of } from 'rxjs';
import { OpenLibraryEnrichmentService } from './open-library-enrichment.service';

describe('OpenLibraryEnrichmentService', () => {
  const http = { get: jest.fn() };

  let service: OpenLibraryEnrichmentService;

  beforeEach(() => {
    http.get.mockReset();
    service = new OpenLibraryEnrichmentService(http as never);
  });

  it('lookupGenreFromProviderId returns first work subject', async () => {
    http.get.mockReturnValue(
      of({
        data: { subjects: ['Science fiction', 'Adventure'] },
      }),
    );

    const genre = await service.lookupGenreFromProviderId('/works/OL123W');

    expect(http.get).toHaveBeenCalledWith(
      'https://openlibrary.org/works/OL123W.json',
    );
    expect(genre).toBe('Science fiction');
  });

  it('lookupGenreFromProviderId resolves edition key to work subjects', async () => {
    http.get
      .mockReturnValueOnce(
        of({
          data: {
            works: [{ key: '/works/OL456W' }],
          },
        }),
      )
      .mockReturnValueOnce(
        of({
          data: { subjects: ['Fantasy'] },
        }),
      );

    const genre = await service.lookupGenreFromProviderId('/books/OL789M');

    expect(http.get).toHaveBeenNthCalledWith(
      1,
      'https://openlibrary.org/books/OL789M.json',
    );
    expect(http.get).toHaveBeenNthCalledWith(
      2,
      'https://openlibrary.org/works/OL456W.json',
    );
    expect(genre).toBe('Fantasy');
  });

  it('lookupGenreFromProviderId returns null when work has no subjects', async () => {
    http.get.mockReturnValue(of({ data: {} }));

    const genre = await service.lookupGenreFromProviderId('/works/OL000W');

    expect(genre).toBeNull();
  });
});
