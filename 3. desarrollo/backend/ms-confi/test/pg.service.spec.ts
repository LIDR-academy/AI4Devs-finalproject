import { Test, TestingModule } from '@nestjs/testing';
import { PgService } from '../src/common/database/pg.config';
import { LoggerService } from '../src/common/log/logger.service';

describe('PgService', () => {
  let service: PgService;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PgService,
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            logDatabaseQuery: jest.fn(),
            logDatabaseError: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PgService>(PgService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('healthCheck', () => {
    it('should return true when database is healthy', async () => {
      // Mock the query method to return successfully
      jest.spyOn(service, 'query').mockResolvedValue([{ test: 1 }]);

      const result = await service.healthCheck();

      expect(result).toBe(true);
      expect(service.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should return false when database is not healthy', async () => {
      // Mock the query method to throw an error
      jest.spyOn(service, 'query').mockRejectedValue(new Error('Connection failed'));

      const result = await service.healthCheck();

      expect(result).toBe(false);
      expect(loggerService.error).toHaveBeenCalled();
    });
  });

  describe('getPoolStats', () => {
    it('should return pool statistics', () => {
      const stats = service.getPoolStats();

      expect(stats).toHaveProperty('totalCount');
      expect(stats).toHaveProperty('idleCount');
      expect(stats).toHaveProperty('waitingCount');
      expect(typeof stats.totalCount).toBe('number');
      expect(typeof stats.idleCount).toBe('number');
      expect(typeof stats.waitingCount).toBe('number');
    });
  });

  describe('findOne', () => {
    it('should throw error when no where conditions provided', async () => {
      await expect(
        service.findOne('test_table', { where: {} })
      ).rejects.toThrow('Se requiere al menos una condici�n WHERE');
    });

    it('should execute query with proper parameters', async () => {
      const mockResult = { id: '1', name: 'test' };
      jest.spyOn(service, 'queryGet').mockResolvedValue(mockResult);

      const result = await service.findOne('test_table', {
        where: { id: '1' },
        select: ['id', 'name'],
        orderBy: 'name ASC',
      });

      expect(result).toEqual(mockResult);
      expect(service.queryGet).toHaveBeenCalledWith(
        'SELECT id, name FROM test_table WHERE id = $1 ORDER BY name ASC LIMIT 1',
        ['1']
      );
    });
  });

  describe('create', () => {
    it('should throw error when entity is empty', async () => {
      await expect(
        service.create('test_table', {})
      ).rejects.toThrow('No se pueden insertar entidades vac�as');
    });

    it('should execute insert query with proper parameters', async () => {
      const mockResult = { id: '1', name: 'test', createdAt: '2023-01-01' };
      jest.spyOn(service, 'queryGet').mockResolvedValue(mockResult);

      const entity = { name: 'test', createdAt: '2023-01-01' };
      const result = await service.create('test_table', entity);

      expect(result).toEqual(mockResult);
      expect(service.queryGet).toHaveBeenCalledWith(
        'INSERT INTO test_table (name, createdAt) VALUES ($1, $2) RETURNING *',
        ['test', '2023-01-01']
      );
    });
  });

  describe('update', () => {
    it('should throw error when entity is empty', async () => {
      await expect(
        service.update('test_table', {}, { id: '1' })
      ).rejects.toThrow('No se pueden actualizar entidades vac�as');
    });

    it('should throw error when where conditions are empty', async () => {
      await expect(
        service.update('test_table', { name: 'test' }, {})
      ).rejects.toThrow('Se requiere al menos una condici�n WHERE para actualizar');
    });

    it('should execute update query with proper parameters', async () => {
      const mockResult = { id: '1', name: 'updated', updatedAt: '2023-01-01' };
      jest.spyOn(service, 'queryGet').mockResolvedValue(mockResult);

      const entity = { name: 'updated', updatedAt: '2023-01-01' };
      const where = { id: '1' };
      const result = await service.update('test_table', entity, where);

      expect(result).toEqual(mockResult);
      expect(service.queryGet).toHaveBeenCalledWith(
        'UPDATE test_table SET name = $1, updatedAt = $2 WHERE id = $3 RETURNING *',
        ['updated', '2023-01-01', '1']
      );
    });
  });

  describe('delete', () => {
    it('should throw error when where conditions are empty', async () => {
      await expect(
        service.delete('test_table', {})
      ).rejects.toThrow('Se requiere al menos una condici�n WHERE para eliminar');
    });

    it('should execute delete query with proper parameters', async () => {
      const mockResult = { id: '1', name: 'deleted' };
      jest.spyOn(service, 'queryGet').mockResolvedValue(mockResult);

      const where = { id: '1' };
      const result = await service.delete('test_table', where);

      expect(result).toEqual(mockResult);
      expect(service.queryGet).toHaveBeenCalledWith(
        'DELETE FROM test_table WHERE id = $1 RETURNING *',
        ['1']
      );
    });
  });

  describe('findAndCount', () => {
    it('should execute paginated query with proper parameters', async () => {
      const mockData = [{ id: '1', name: 'test' }];
      const mockTotal = 1;
      jest.spyOn(service, 'queryList')
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce([{ total: mockTotal }]);

      const result = await service.findAndCount('test_table', {
        where: { isActive: true },
        skip: 0,
        take: 10,
        order: { name: 'ASC' },
        select: ['id', 'name'],
      });

      expect(result).toEqual([mockData, mockTotal]);
      expect(service.queryList).toHaveBeenCalledTimes(2);
    });
  });
});

