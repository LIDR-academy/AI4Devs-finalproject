import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from '../books/books.module';
import { Book } from '../books/entities/book.entity';
import { TbrAutoCreateJob } from './jobs/tbr-auto-create.job';
import { MonthlyTbrList } from './entities/monthly-tbr-list.entity';
import { TbrEntry } from './entities/tbr-entry.entity';
import { TbrController } from './tbr.controller';
import { TbrService } from './tbr.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MonthlyTbrList, TbrEntry, Book]),
    forwardRef(() => BooksModule),
  ],
  controllers: [TbrController],
  providers: [TbrService, TbrAutoCreateJob],
  exports: [TbrService],
})
export class ListsModule {}
