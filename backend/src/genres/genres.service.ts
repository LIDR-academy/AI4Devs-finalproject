import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_GENRE_NAMES } from './genres.constants';
import { Genre } from './entities/genre.entity';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private readonly genresRepo: Repository<Genre>,
  ) {}

  async hasGenres(userId: string): Promise<boolean> {
    const count = await this.genresRepo.count({ where: { userId } });
    return count > 0;
  }

  async findOwnedById(userId: string, genreId: string): Promise<Genre | null> {
    return this.genresRepo.findOne({
      where: { id: genreId, userId },
    });
  }

  async seedDefaultsForUser(userId: string): Promise<Genre[]> {
    if (await this.hasGenres(userId)) {
      return this.genresRepo.find({ where: { userId }, order: { name: 'ASC' } });
    }

    const rows = DEFAULT_GENRE_NAMES.map((name) =>
      this.genresRepo.create({
        userId,
        name,
        isDefault: true,
      }),
    );

    return this.genresRepo.save(rows);
  }

  async findOrCreateByName(
    userId: string,
    name: string,
  ): Promise<Genre | null> {
    const trimmed = name.trim();
    if (!trimmed) {
      return null;
    }

    await this.seedDefaultsForUser(userId);

    const existing = await this.genresRepo
      .createQueryBuilder('genre')
      .where('genre.user_id = :userId', { userId })
      .andWhere('LOWER(genre.name) = LOWER(:name)', { name: trimmed })
      .getOne();

    if (existing) {
      return existing;
    }

    return this.genresRepo.save(
      this.genresRepo.create({
        userId,
        name: trimmed,
        isDefault: false,
      }),
    );
  }

  async resolveGenreIdByName(
    userId: string,
    genreName: string | null | undefined,
  ): Promise<string | null> {
    if (genreName === undefined || genreName === null) {
      return null;
    }

    const genre = await this.findOrCreateByName(userId, genreName);
    return genre?.id ?? null;
  }
}
