import { Repository } from 'typeorm';
import { Book } from '../src/books/entities/book.entity';
import { CatalogEdition } from '../src/books/entities/catalog-edition.entity';
import { ReadingRecord } from '../src/books/entities/reading-record.entity';

export interface SeedCatalogBookInput {
  userId: string;
  title: string;
  authors: string;
  genreId?: string | null;
  audienceId?: string | null;
  notes?: string | null;
}

export async function seedCatalogBook(
  catalogRepo: Repository<CatalogEdition>,
  bookRepo: Repository<Book>,
  readingRepo: Repository<ReadingRecord>,
  input: SeedCatalogBookInput,
): Promise<Book> {
  const catalog = await catalogRepo.save(
    catalogRepo.create({
      title: input.title,
      authors: input.authors,
      isbn13: null,
      isbn10: null,
      coverImageUrl: null,
      pageCount: null,
      seriesName: null,
      publicationYear: null,
      catalogGenre: null,
      dataSource: 'manual',
      externalProviderId: null,
    }),
  );

  const book = await bookRepo.save(
    bookRepo.create({
      userId: input.userId,
      catalogEditionId: catalog.id,
      genreId: input.genreId ?? null,
      notes: input.notes ?? null,
      audience: null,
      audienceId: input.audienceId ?? null,
    }),
  );

  await readingRepo.save(
    readingRepo.create({
      bookId: book.id,
      status: 'pendiente',
    }),
  );

  return book;
}
