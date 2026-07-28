import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../books/entities/book.entity';
import { Genre } from './entities/genre.entity';
import { GenreMatcherService } from './genre-matcher.service';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';

@Module({
  imports: [TypeOrmModule.forFeature([Genre, Book])],
  controllers: [GenresController],
  providers: [GenresService, GenreMatcherService],
  exports: [GenresService, GenreMatcherService, TypeOrmModule],
})
export class GenresModule {}
