import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Book } from './books/entities/book.entity';
import { CatalogEdition } from './books/entities/catalog-edition.entity';
import { UserBookOverride } from './books/entities/user-book-override.entity';
import { ReadingRecord } from './books/entities/reading-record.entity';
import { Audience } from './audiences/entities/audience.entity';
import { Format } from './formats/entities/format.entity';
import { Genre } from './genres/entities/genre.entity';
import { MonthlyTbrList } from './lists/entities/monthly-tbr-list.entity';
import { TbrEntry } from './lists/entities/tbr-entry.entity';
import { User } from './users/user.entity';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Book, CatalogEdition, UserBookOverride, ReadingRecord, MonthlyTbrList, TbrEntry, Audience, Format, Genre],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
});
