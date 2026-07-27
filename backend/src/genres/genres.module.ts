import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { GenresService } from './genres.service';

@Module({
  imports: [TypeOrmModule.forFeature([Genre])],
  providers: [GenresService],
  exports: [GenresService, TypeOrmModule],
})
export class GenresModule {}
