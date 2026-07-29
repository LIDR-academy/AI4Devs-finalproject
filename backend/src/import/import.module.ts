import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from '../books/books.module';
import { FormatsModule } from '../formats/formats.module';
import { GenresModule } from '../genres/genres.module';
import { Book } from '../books/entities/book.entity';
import { ReadingRecord } from '../books/entities/reading-record.entity';
import { ImportJob } from './entities/import-job.entity';
import { GoodreadsImportProcessor } from './goodreads/goodreads-import.processor';
import { ImportCatalogEnrichmentService } from './goodreads/import-catalog-enrichment.service';
import { GoodreadsGenrePreviewService } from './goodreads/goodreads-genre-preview.service';
import { ImportController } from './import.controller';
import { ImportJobRunner } from './import-job.runner';
import { ImportJobService } from './import-job.service';
import { ImportService } from './import.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, ReadingRecord, ImportJob]),
    BooksModule,
    FormatsModule,
    GenresModule,
  ],
  controllers: [ImportController],
  providers: [
    ImportService,
    ImportJobService,
    ImportJobRunner,
    GoodreadsImportProcessor,
    ImportCatalogEnrichmentService,
    GoodreadsGenrePreviewService,
  ],
  exports: [ImportService],
})
export class ImportModule {}
