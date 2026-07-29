import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from '../books/entities/book.entity';
import { DEFAULT_AUDIENCE_NAMES } from './audiences.constants';
import { AudiencesService } from './audiences.service';
import { Audience } from './entities/audience.entity';

describe('AudiencesService', () => {
  let service: AudiencesService;
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
            id: `audience-${index + 1}`,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          }));
        }
        return {
          ...value,
          id: 'audience-1',
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

    const module = await Test.createTestingModule({
      providers: [
        AudiencesService,
        { provide: getRepositoryToken(Audience), useValue: repo },
        { provide: getRepositoryToken(Book), useValue: booksRepo },
      ],
    }).compile();

    service = module.get(AudiencesService);
  });

  it('seeds default audiences for a new user', async () => {
    repo.count.mockResolvedValue(0);

    const result = await service.seedDefaultsForUser('user-1');

    expect(repo.create).toHaveBeenCalledTimes(DEFAULT_AUDIENCE_NAMES.length);
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(DEFAULT_AUDIENCE_NAMES.length);
    expect(result.map((row) => row.name)).toEqual([...DEFAULT_AUDIENCE_NAMES]);
    expect(result.every((row) => row.isDefault)).toBe(true);
  });

  it('does not seed again when audiences already exist', async () => {
    const existing = [{ id: 'a1', userId: 'user-1', name: 'Adulto' }] as Audience[];
    repo.count.mockResolvedValue(1);
    repo.find.mockResolvedValue(existing);

    const result = await service.seedDefaultsForUser('user-1');

    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
    expect(result).toEqual(existing);
  });

  it('creates a new audience when name is unique', async () => {
    const created = await service.createForUser('user-1', 'Young Adult');

    expect(created.name).toBe('Young Adult');
    expect(created.is_default).toBe(false);
    expect(repo.save).toHaveBeenCalled();
  });

  it('rejects duplicate audience names case-insensitively', async () => {
    queryBuilder.getOne.mockResolvedValue({ id: 'existing' });

    await expect(service.createForUser('user-1', 'adulto')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('counts books affected by an owned audience', async () => {
    const audience = { id: 'audience-1', userId: 'user-1', name: 'Adulto' } as Audience;
    repo.findOne.mockResolvedValue(audience);
    booksRepo.count.mockResolvedValue(3);

    const result = await service.countAffectedBooks('user-1', 'audience-1');

    expect(result).toEqual({ affected_book_count: 3 });
    expect(booksRepo.count).toHaveBeenCalledWith({
      where: { userId: 'user-1', audienceId: 'audience-1' },
    });
  });

  it('deletes an owned audience', async () => {
    const audience = { id: 'audience-1', userId: 'user-1', name: 'Adulto' } as Audience;
    repo.findOne.mockResolvedValue(audience);

    await service.deleteForUser('user-1', 'audience-1');

    expect(repo.remove).toHaveBeenCalledWith(audience);
  });
});
