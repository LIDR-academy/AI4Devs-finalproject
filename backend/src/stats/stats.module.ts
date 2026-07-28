import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Audience } from '../audiences/entities/audience.entity';
import { Format } from '../formats/entities/format.entity';
import { Genre } from '../genres/entities/genre.entity';
import { CatalogEdition } from '../books/entities/catalog-edition.entity';
import { UserBookOverride } from '../books/entities/user-book-override.entity';
import { Book } from '../books/entities/book.entity';
import { ReadingRecord } from '../books/entities/reading-record.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Book,
      CatalogEdition,
      UserBookOverride,
      ReadingRecord,
      Audience,
      Format,
      Genre,
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
