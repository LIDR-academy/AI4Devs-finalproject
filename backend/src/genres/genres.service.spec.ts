import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from '../books/entities/book.entity';
import { DEFAULT_GENRE_NAMES } from './genres.constants';
import { GenreMatcherService } from './genre-matcher.service';
import { GenresService } from './genres.service';
import { Genre } from './entities/genre.entity';

describe('GenresService', () => {
  let service: GenresService;
  let repo: {
    count: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let booksRepo: {
    count: jest.Mock;
  };
  let genreMatcher: {
    match: jest.Mock;
    matchMany: jest.Mock;
  };
  let queryBuilder: {
    where: jest.Mock;
    andWhere: jest.Mock;
    getOne: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

    repo = {
      count: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => {
        if (Array.isArray(value)) {
          return value.map((row, index) => ({
            ...row,
            id: `genre-${index + 1}`,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          }));
        }
        return {
          ...value,
          id: 'genre-custom',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        };
      }),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => queryBuilder),
    };

    booksRepo = {
      count: jest.fn(),
    };

    genreMatcher = {
      match: jest.fn(),
      matchMany: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        GenresService,
        { provide: getRepositoryToken(Genre), useValue: repo },
        { provide: getRepositoryToken(Book), useValue: booksRepo },
        { provide: GenreMatcherService, useValue: genreMatcher },
      ],
    }).compile();

    service = module.get(GenresService);
  });

  it('seeds default genres for a new user', async () => {
    repo.count.mockResolvedValue(0);

    const result = await service.seedDefaultsForUser('user-1');

    expect(repo.create).toHaveBeenCalledTimes(DEFAULT_GENRE_NAMES.length);
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(DEFAULT_GENRE_NAMES.length);
    expect(result.map((row) => row.name)).toEqual([...DEFAULT_GENRE_NAMES]);
    expect(result.every((row) => row.isDefault)).toBe(true);
  });

  it('does not seed again when genres already exist', async () => {
    const existing = [{ id: 'g1', userId: 'user-1', name: 'Fantasía' }] as Genre[];
    repo.count.mockResolvedValue(1);
    repo.find.mockResolvedValue(existing);

    const result = await service.seedDefaultsForUser('user-1');

    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
    expect(result).toEqual(existing);
  });

  it('lists genres for a user', async () => {
    repo.find.mockResolvedValue([
      {
        id: 'g1',
        name: 'Fantasía',
        isDefault: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);

    const result = await service.listForUser('user-1');

    expect(result).toEqual([
      {
        id: 'g1',
        name: 'Fantasía',
        is_default: true,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    ]);
  });

  it('rejects duplicate genre names case-insensitively', async () => {
    queryBuilder.getOne.mockResolvedValue({ id: 'g1', name: 'Fantasía' });

    await expect(service.createForUser('user-1', 'fantasía')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('creates a custom genre when name is unique', async () => {
    const result = await service.createForUser('user-1', 'Misterio');

    expect(repo.create).toHaveBeenCalledWith({
      userId: 'user-1',
      name: 'Misterio',
      isDefault: false,
    });
    expect(result.name).toBe('Misterio');
    expect(result.is_default).toBe(false);
  });

  it('deletes an owned genre', async () => {
    const genre = { id: 'g1', userId: 'user-1', name: 'Misterio' } as Genre;
    repo.findOne.mockResolvedValue(genre);

    await service.deleteForUser('user-1', 'g1');

    expect(repo.remove).toHaveBeenCalledWith(genre);
  });

  it('counts books affected by an owned genre', async () => {
    repo.findOne.mockResolvedValue({ id: 'g1', userId: 'user-1' } as Genre);
    booksRepo.count.mockResolvedValue(3);

    const result = await service.countAffectedBooks('user-1', 'g1');

    expect(booksRepo.count).toHaveBeenCalledWith({
      where: { userId: 'user-1', genreId: 'g1' },
    });
    expect(result).toEqual({ affected_book_count: 3 });
  });

  it('throws when counting affected books for a missing genre', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(
      service.countAffectedBooks('user-1', 'missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when deleting a missing genre', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.deleteForUser('user-1', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findOrCreateByName creates a custom genre when missing', async () => {
    repo.count.mockResolvedValue(1);

    const genre = await service.findOrCreateByName('user-1', '  Mystery  ');

    expect(repo.create).toHaveBeenCalledWith({
      userId: 'user-1',
      name: 'Mystery',
      isDefault: false,
    });
    expect(genre?.name).toBe('Mystery');
  });

  it('resolveGenreIdByName returns null for blank input', async () => {
    await expect(service.resolveGenreIdByName('user-1', '   ')).resolves.toBeNull();
    expect(repo.createQueryBuilder).not.toHaveBeenCalled();
  });
});
