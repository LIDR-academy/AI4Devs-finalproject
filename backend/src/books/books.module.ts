import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsModule } from '../lists/lists.module';
import { AudiencesModule } from '../audiences/audiences.module';
import { FormatsModule } from '../formats/formats.module';
import { GenresModule } from '../genres/genres.module';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CatalogService } from './catalog/catalog.service';
import { BookCoverSearchService } from './catalog/book-cover-search.service';
import { CatalogRateLimiter } from './catalog/catalog-rate-limiter.service';
import { EditionCoversService } from './catalog/edition-covers.service';
import { GoogleBooksCoversService } from './catalog/google-books-covers.service';
import { OpenLibraryEnrichmentService } from './catalog/open-library-enrichment.service';
import { OpenLibraryCoversService } from './catalog/open-library-covers.service';
import { GoogleBooksClient } from './catalog/google-books.client';
import { OpenLibraryClient } from './catalog/open-library.client';
import { GenreNormalizerService } from './genre-normalizer.service';
import { Book } from './entities/book.entity';
import { ReadingRecord } from './entities/reading-record.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 12_000,
      headers: {
        'User-Agent': 'ReadingAnalyticsPlatform/1.0 (educational)',
        Accept: 'application/json',
      },
    }),
    TypeOrmModule.forFeature([Book, ReadingRecord]),
    forwardRef(() => ListsModule),
    AudiencesModule,
    FormatsModule,
    GenresModule,
  ],
  controllers: [BooksController],
  providers: [
    BooksService,
    BookCoverSearchService,
    CatalogService,
    CatalogRateLimiter,
    EditionCoversService,
    OpenLibraryEnrichmentService,
    OpenLibraryCoversService,
    GoogleBooksCoversService,
    OpenLibraryClient,
    GoogleBooksClient,
    GenreNormalizerService,
  ],
  exports: [BooksService, CatalogService, CatalogRateLimiter],
})
export class BooksModule {}
