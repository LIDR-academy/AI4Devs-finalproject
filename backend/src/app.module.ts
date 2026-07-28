import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { Book } from './books/entities/book.entity';
import { CatalogEdition } from './books/entities/catalog-edition.entity';
import { UserBookOverride } from './books/entities/user-book-override.entity';
import { ReadingRecord } from './books/entities/reading-record.entity';
import { GoalsModule } from './goals/goals.module';
import { AnnualReadingGoal } from './goals/entities/annual-reading-goal.entity';
import { ListsModule } from './lists/lists.module';
import { MonthlyTbrList } from './lists/entities/monthly-tbr-list.entity';
import { TbrEntry } from './lists/entities/tbr-entry.entity';
import { StatsModule } from './stats/stats.module';
import { ImportModule } from './import/import.module';
import { ImportJob } from './import/entities/import-job.entity';
import { Audience } from './audiences/entities/audience.entity';
import { AudiencesModule } from './audiences/audiences.module';
import { Format } from './formats/entities/format.entity';
import { FormatsModule } from './formats/formats.module';
import { Genre } from './genres/entities/genre.entity';
import { GenresModule } from './genres/genres.module';
import { UserProfile } from './preferences/entities/user-profile.entity';
import { PreferencesModule } from './preferences/preferences.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [User, UserProfile, Book, CatalogEdition, UserBookOverride, ReadingRecord, MonthlyTbrList, TbrEntry, AnnualReadingGoal, ImportJob, Audience, Format, Genre],
        migrations: [`${__dirname}/migrations/*{.ts,.js}`],
        migrationsRun: config.get('TYPEORM_MIGRATIONS_RUN') === 'true',
        synchronize: config.get('TYPEORM_SYNCHRONIZE') === 'true',
      }),
    }),
    UsersModule,
    AuthModule,
    AudiencesModule,
    FormatsModule,
    GenresModule,
    PreferencesModule,
    BooksModule,
    ListsModule,
    GoalsModule,
    StatsModule,
    ImportModule,
  ],
})
export class AppModule {}
