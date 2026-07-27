import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DEFAULT_GENRE_NAMES } from './genres.constants';
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
    createQueryBuilder: jest.Mock;
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
      createQueryBuilder: jest.fn(() => queryBuilder),
    };

    const module = await Test.createTestingModule({
      providers: [
        GenresService,
        { provide: getRepositoryToken(Genre), useValue: repo },
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
