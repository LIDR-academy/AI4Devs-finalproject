/** Known Goodreads library export columns (case-sensitive). */
export const GOODREADS_CSV_HEADERS = [
  'Book Id',
  'Title',
  'Author',
  'Author l-f',
  'Additional Authors',
  'ISBN',
  'ISBN13',
  'My Rating',
  'Publisher',
  'Binding',
  'Number of Pages',
  'Year Published',
  'Original Publication Year',
  'Date Read',
  'Date Added',
  'Bookshelves',
  'Bookshelves with positions',
  'Exclusive Shelf',
  'My Review',
  'Spoiler',
  'Private Notes',
  'Read Count',
  'Owned Copies',
] as const;

/** Present in some exports but omitted in others (e.g. current Goodreads library CSV). */
export const GOODREADS_OPTIONAL_HEADERS = ['Average Rating'] as const;

export type GoodreadsCsvHeader =
  | (typeof GOODREADS_CSV_HEADERS)[number]
  | (typeof GOODREADS_OPTIONAL_HEADERS)[number];

export const GOODREADS_REQUIRED_HEADERS: GoodreadsCsvHeader[] = [
  'Book Id',
  'Title',
  'Author',
  'ISBN',
  'ISBN13',
  'My Rating',
  'Binding',
  'Number of Pages',
  'Year Published',
  'Original Publication Year',
  'Date Read',
  'Date Added',
  'Exclusive Shelf',
  'Read Count',
];
