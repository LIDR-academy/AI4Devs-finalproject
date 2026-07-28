import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { DEFAULT_GENRE_NAMES } from './genres.constants';
import { AffectedBooksResponseDto } from './dto/affected-books-response.dto';
import { GenreResponseDto, toGenreResponse } from './dto/genre-response.dto';
import { GenreMatcherService } from './genre-matcher.service';
import type { GenreMatchResult } from './genre-matcher.service';
import type { GenreResolutionMap } from './genre-resolution.types';
import { Genre } from './entities/genre.entity';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private readonly genresRepo: Repository<Genre>,
    @InjectRepository(Book)
    private readonly booksRepo: Repository<Book>,
    private readonly genreMatcher: GenreMatcherService,
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

  async listForUser(userId: string): Promise<GenreResponseDto[]> {
    const rows = await this.genresRepo.find({
      where: { userId },
      order: { name: 'ASC' },
    });
    return rows.map(toGenreResponse);
  }

  private async listOwnedRefs(userId: string): Promise<Array<{ id: string; name: string }>> {
    const rows = await this.genresRepo.find({
      where: { userId },
      order: { name: 'ASC' },
    });
    return rows.map((row) => ({ id: row.id, name: row.name }));
  }

  async matchRawGenre(
    userId: string,
    rawGenre: string | null | undefined,
  ): Promise<GenreMatchResult> {
    const userGenres = await this.listOwnedRefs(userId);
    return this.genreMatcher.match(rawGenre, userGenres);
  }

  async matchRawGenres(
    userId: string,
    rawGenres: string[],
  ): Promise<GenreMatchResult[]> {
    const userGenres = await this.listOwnedRefs(userId);
    return this.genreMatcher.matchMany(rawGenres, userGenres);
  }

  async resolveImportedGenre(
    userId: string,
    rawGenre: string | null | undefined,
    resolutions: GenreResolutionMap = {},
  ): Promise<string | null> {
    const match = await this.matchRawGenre(userId, rawGenre);
    if (match.status === 'matched') {
      return match.genre_id;
    }

    if (match.status !== 'unresolved') {
      return null;
    }

    const resolution = resolutions[match.raw_genre];
    if (!resolution) {
      return null;
    }

    if (resolution.action === 'skip') {
      return null;
    }

    if (resolution.action === 'assign') {
      const owned = await this.findOwnedById(userId, resolution.genre_id);
      return owned?.id ?? null;
    }

    const created = await this.createForUser(userId, match.raw_genre);
    return created.id;
  }

  async createForUser(userId: string, name: string): Promise<GenreResponseDto> {
    const duplicate = await this.genresRepo
      .createQueryBuilder('genre')
      .where('genre.user_id = :userId', { userId })
      .andWhere('LOWER(genre.name) = LOWER(:name)', { name })
      .getOne();

    if (duplicate) {
      throw new ConflictException({
        statusCode: 409,
        message: 'Ya existe un género con este nombre',
        code: 'GENRE_DUPLICATE',
      });
    }

    const genre = await this.genresRepo.save(
      this.genresRepo.create({
        userId,
        name,
        isDefault: false,
      }),
    );

    return toGenreResponse(genre);
  }

  async countAffectedBooks(
    userId: string,
    genreId: string,
  ): Promise<AffectedBooksResponseDto> {
    const genre = await this.genresRepo.findOne({
      where: { id: genreId, userId },
    });

    if (!genre) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Género no encontrado',
        code: 'GENRE_NOT_FOUND',
      });
    }

    const affected_book_count = await this.booksRepo.count({
      where: { userId, genreId },
    });

    return { affected_book_count };
  }

  async deleteForUser(userId: string, genreId: string): Promise<void> {
    const genre = await this.genresRepo.findOne({
      where: { id: genreId, userId },
    });

    if (!genre) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Género no encontrado',
        code: 'GENRE_NOT_FOUND',
      });
    }

    await this.genresRepo.remove(genre);
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
