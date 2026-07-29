import {
  pickGenreFromSubjects,
  resolveGenre,
  resolvePageCount,
} from './open-library-enrichment';

describe('open-library-enrichment', () => {
  it('pickGenreFromSubjects skips series prefix', () => {
    expect(
      pickGenreFromSubjects(['series:Harry_Potter', 'Fantasy', 'Witches']),
    ).toBe('Fantasy');
  });

  it('resolvePageCount prefers cover edition match', () => {
    const pages = resolvePageCount(undefined, 'OL99M', [
      { key: '/books/OL99M', number_of_pages: 320 },
      { key: '/books/OL100M', number_of_pages: 400 },
    ]);
    expect(pages).toBe(320);
  });

  it('resolveGenre uses work subjects first', () => {
    expect(resolveGenre(['Science fiction'], ['Witches'], ['Harry Potter'])).toBe(
      'Science fiction',
    );
  });
});
