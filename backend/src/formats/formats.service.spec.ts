import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReadingRecord } from '../books/entities/reading-record.entity';
import { DEFAULT_FORMAT_NAMES } from './formats.constants';
import { FormatsService } from './formats.service';
import { Format } from './entities/format.entity';

describe('FormatsService', () => {
  let service: FormatsService;
  let repo: {
    count: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let readingRepo: {
    createQueryBuilder: jest.Mock;
  };
  let queryBuilder: {
    where: jest.Mock;
    andWhere: jest.Mock;
    getOne: jest.Mock;
  };
  let readingQueryBuilder: {
    innerJoin: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    getCount: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

    readingQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(3),
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
            id: `format-${index + 1}`,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          }));
        }
        return {
          ...value,
          id: 'format-1',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        };
      }),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => queryBuilder),
    };

    readingRepo = {
      createQueryBuilder: jest.fn(() => readingQueryBuilder),
    };

    const module = await Test.createTestingModule({
      providers: [
        FormatsService,
        { provide: getRepositoryToken(Format), useValue: repo },
        { provide: getRepositoryToken(ReadingRecord), useValue: readingRepo },
      ],
    }).compile();

    service = module.get(FormatsService);
  });

  it('seeds default formats for a new user', async () => {
    repo.count.mockResolvedValue(0);

    const result = await service.seedDefaultsForUser('user-1');

    expect(repo.create).toHaveBeenCalledTimes(DEFAULT_FORMAT_NAMES.length);
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(DEFAULT_FORMAT_NAMES.length);
    expect(result.map((row) => row.name)).toEqual([...DEFAULT_FORMAT_NAMES]);
    expect(result.every((row) => row.isDefault)).toBe(true);
  });

  it('does not seed again when formats already exist', async () => {
    const existing = [{ id: 'f1', userId: 'user-1', name: 'Físico' }] as Format[];
    repo.count.mockResolvedValue(1);
    repo.find.mockResolvedValue(existing);

    const result = await service.seedDefaultsForUser('user-1');

    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
    expect(result).toEqual(existing);
  });

  it('resolves legacy read_format slug to owned format id', async () => {
    repo.count.mockResolvedValue(1);
    queryBuilder.getOne.mockResolvedValue({ id: 'format-fisico' });

    const formatId = await service.resolveFormatIdByLegacySlug('user-1', 'fisico');

    expect(formatId).toBe('format-fisico');
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'LOWER(format.name) = LOWER(:name)',
      { name: 'Físico' },
    );
  });

  it('returns null when clearing read_format', async () => {
    const formatId = await service.resolveFormatIdByLegacySlug('user-1', null);

    expect(formatId).toBeNull();
    expect(repo.count).not.toHaveBeenCalled();
  });

  it('creates a new format when name is unique', async () => {
    const created = await service.createForUser('user-1', 'Audiolibro por capítulos');

    expect(created.name).toBe('Audiolibro por capítulos');
    expect(created.is_default).toBe(false);
    expect(repo.save).toHaveBeenCalled();
  });

  it('rejects duplicate format names case-insensitively', async () => {
    queryBuilder.getOne.mockResolvedValue({ id: 'existing' });

    await expect(
      service.createForUser('user-1', 'físico'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('deletes an owned format', async () => {
    const format = { id: 'format-1', userId: 'user-1', name: 'Ebook' } as Format;
    repo.findOne.mockResolvedValue(format);

    await service.deleteForUser('user-1', 'format-1');

    expect(repo.remove).toHaveBeenCalledWith(format);
  });

  it('counts affected readings for an owned format', async () => {
    repo.findOne.mockResolvedValue({ id: 'format-1', userId: 'user-1' });

    const result = await service.countAffectedReadings('user-1', 'format-1');

    expect(result).toEqual({ affected_reading_count: 3 });
    expect(readingQueryBuilder.innerJoin).toHaveBeenCalledWith('reading.book', 'book');
    expect(readingQueryBuilder.andWhere).toHaveBeenCalledWith(
      'reading.format_id = :formatId',
      { formatId: 'format-1' },
    );
  });
});
