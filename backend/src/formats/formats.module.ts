import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingRecord } from '../books/entities/reading-record.entity';
import { Format } from './entities/format.entity';
import { FormatsController } from './formats.controller';
import { FormatsService } from './formats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Format, ReadingRecord])],
  controllers: [FormatsController],
  providers: [FormatsService],
  exports: [FormatsService, TypeOrmModule],
})
export class FormatsModule {}
