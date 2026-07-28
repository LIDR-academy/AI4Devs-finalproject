import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../books/entities/book.entity';
import { Genre } from './entities/genre.entity';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';

@Module({
  imports: [TypeOrmModule.forFeature([Genre, Book])],
  controllers: [GenresController],
  providers: [GenresService],
  exports: [GenresService, TypeOrmModule],
})
export class GenresModule {}
