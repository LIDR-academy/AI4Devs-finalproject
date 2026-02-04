import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';
import { MetricsService } from '../../monitoring/metrics.service';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import { QueryAuditLogDto } from '../dto/query-audit-log.dto';
import { v4 as uuidv4 } from 'uuid';

describe('AuditService', () => {
  let service: AuditService;
  let auditLogRepository: Repository<AuditLog>;
  let metricsService: MetricsService;

  const createMockQueryBuilder = () => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getMany: jest.fn(),
  });

  const mockAuditLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(createMockQueryBuilder),
  };

  const mockMetricsService = {
    recordAuditLog: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditLogRepository,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    auditLogRepository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
    metricsService = module.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('debería crear un log de auditoría exitosamente', async () => {
      const userId = uuidv4();
      const dto: CreateAuditLogDto = {
        userId,
        action: AuditAction.CREATE,
        entityType: 'Patient',
        entityId: uuidv4(),
        changes: { after: { name: 'Test' } },
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        endpoint: '/api/v1/hce/patients',
        method: 'POST',
      };

      const savedLog = {
        id: uuidv4(),
        ...dto,
        createdAt: new Date(),
      };

      mockAuditLogRepository.create.mockReturnValue(savedLog);
      mockAuditLogRepository.save.mockResolvedValue(savedLog);

      const result = await service.log(dto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(mockAuditLogRepository.save).toHaveBeenCalled();
      expect(mockMetricsService.recordAuditLog).toHaveBeenCalledWith(
        AuditAction.CREATE,
        'Patient',
      );
    });
  });

  describe('findById', () => {
    it('debería retornar un log si existe', async () => {
      const logId = uuidv4();
      const log = {
        id: logId,
        userId: uuidv4(),
        action: AuditAction.CREATE,
        entityType: 'Patient',
      };

      mockAuditLogRepository.findOne.mockResolvedValue(log);

      const result = await service.findById(logId);

      expect(result).toEqual(log);
    });

    it('debería lanzar NotFoundException si el log no existe', async () => {
      const logId = uuidv4();

      mockAuditLogRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(logId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('query', () => {
    it('debería retornar logs con filtros', async () => {
      const userId = uuidv4();
      const queryDto: QueryAuditLogDto = {
        userId,
        action: AuditAction.CREATE,
        limit: 10,
        offset: 0,
      };

      const logs = [
        {
          id: uuidv4(),
          userId,
          action: AuditAction.CREATE,
          entityType: 'Patient',
        },
      ];

      const queryBuilder = createMockQueryBuilder();
      queryBuilder.getManyAndCount = jest.fn().mockResolvedValue([logs, 1]);

      mockAuditLogRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.query(queryDto);

      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
    });
  });

  describe('exportUserData', () => {
    it('debería exportar datos de un usuario', async () => {
      const userId = uuidv4();
      const logs = [
        {
          id: uuidv4(),
          userId,
          action: AuditAction.CREATE,
          createdAt: new Date(),
        },
      ];

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(logs),
      };

      mockAuditLogRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.exportUserData({ userId });

      expect(result.userId).toBe(userId);
      expect(result.logs).toBeDefined();
      expect(result.summary).toBeDefined();
    });
  });
});
