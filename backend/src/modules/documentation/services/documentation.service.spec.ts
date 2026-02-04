import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DocumentationService } from './documentation.service';
import {
  Documentation,
  DocumentationStatus,
} from '../entities/documentation.entity';
import { DocumentationVersion } from '../entities/documentation-version.entity';
import { Surgery } from '../../planning/entities/surgery.entity';
import { CreateDocumentationDto } from '../dto/create-documentation.dto';
import { UpdateDocumentationDto } from '../dto/update-documentation.dto';
import { v4 as uuidv4 } from 'uuid';

describe('DocumentationService', () => {
  let service: DocumentationService;
  let documentationRepository: Repository<Documentation>;
  let surgeryRepository: Repository<Surgery>;

  const surgeryId = uuidv4();
  const userId = uuidv4();
  const docId = uuidv4();
  const mockSurgery = { id: surgeryId } as Surgery;
  const mockDocumentation = {
    id: docId,
    surgeryId,
    status: DocumentationStatus.DRAFT,
    changeHistory: [],
  } as Documentation;

  const mockDocumentationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockSurgeryRepository = {
    findOne: jest.fn(),
  };

  const mockDocumentationVersionRepository = {
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn((dto) => ({ ...dto, id: uuidv4() })),
    save: jest.fn((v) => Promise.resolve(v)),
    find: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    mockDocumentationVersionRepository.count.mockResolvedValue(0);
    mockDocumentationVersionRepository.find.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentationService,
        {
          provide: getRepositoryToken(Documentation),
          useValue: mockDocumentationRepository,
        },
        {
          provide: getRepositoryToken(DocumentationVersion),
          useValue: mockDocumentationVersionRepository,
        },
        {
          provide: getRepositoryToken(Surgery),
          useValue: mockSurgeryRepository,
        },
      ],
    }).compile();

    service = module.get<DocumentationService>(DocumentationService);
    documentationRepository = module.get<Repository<Documentation>>(
      getRepositoryToken(Documentation),
    );
    surgeryRepository = module.get<Repository<Surgery>>(
      getRepositoryToken(Surgery),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateDocumentationDto = {
      surgeryId,
      preoperativeNotes: 'Notas preop',
    };

    it('debería crear documentación cuando la cirugía existe y no hay doc previa', async () => {
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockDocumentationRepository.findOne.mockResolvedValue(null);
      mockDocumentationRepository.create.mockReturnValue(mockDocumentation);
      mockDocumentationRepository.save.mockResolvedValue(mockDocumentation);

      const result = await service.create(createDto, userId);

      expect(mockDocumentationRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockDocumentation);
    });

    it('debería lanzar NotFoundException si la cirugía no existe', async () => {
      mockSurgeryRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockDocumentationRepository.save).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si ya existe documentación para la cirugía', async () => {
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockDocumentationRepository.findOne.mockResolvedValue(mockDocumentation);

      await expect(service.create(createDto, userId)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockDocumentationRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findBySurgeryId', () => {
    it('debería devolver la documentación cuando existe', async () => {
      mockDocumentationRepository.findOne.mockResolvedValue(mockDocumentation);

      const result = await service.findBySurgeryId(surgeryId);

      expect(result).toEqual(mockDocumentation);
    });

    it('debería crear y devolver documentación cuando no existe (find-or-create)', async () => {
      mockDocumentationRepository.findOne
        .mockResolvedValueOnce(null) // findBySurgeryId: no existe
        .mockResolvedValueOnce(null) // create: comprobar existing
        .mockResolvedValueOnce(mockDocumentation); // findBySurgeryId: recargar con relations
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockDocumentationRepository.create.mockImplementation((entity) => ({
        ...entity,
        id: docId,
      }));
      mockDocumentationRepository.save.mockResolvedValue(mockDocumentation);

      const result = await service.findBySurgeryId(surgeryId, userId);

      expect(mockSurgeryRepository.findOne).toHaveBeenCalled();
      expect(mockDocumentationRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockDocumentation);
    });
  });

  describe('update', () => {
    const updateDto: UpdateDocumentationDto = {
      intraoperativeNotes: 'Notas intraop actualizadas',
    };

    it('debería actualizar la documentación cuando existe', async () => {
      const updated = { ...mockDocumentation, ...updateDto };
      mockDocumentationRepository.findOne.mockResolvedValue(mockDocumentation);
      mockDocumentationRepository.save.mockResolvedValue(updated);

      const result = await service.update(docId, updateDto, userId);

      expect(mockDocumentationRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('debería lanzar NotFoundException cuando la documentación no existe', async () => {
      mockDocumentationRepository.findOne.mockResolvedValue(null);

      await expect(service.update(docId, updateDto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateField', () => {
    it('debería actualizar un campo permitido cuando la doc existe', async () => {
      mockDocumentationRepository.findOne.mockResolvedValue(mockDocumentation);
      mockDocumentationRepository.save.mockResolvedValue({
        ...mockDocumentation,
        intraoperativeNotes: 'Nuevo valor',
      });

      const result = await service.updateField(
        docId,
        'intraoperativeNotes',
        'Nuevo valor',
        userId,
      );

      expect(mockDocumentationRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('debería lanzar NotFoundException cuando la documentación no existe', async () => {
      mockDocumentationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateField(docId, 'preoperativeNotes', 'x', userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar BadRequestException para campo no permitido', async () => {
      mockDocumentationRepository.findOne.mockResolvedValue(mockDocumentation);

      await expect(
        service.updateField(docId, 'invalidField', 'x', userId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getChangeHistory', () => {
    it('debería devolver el historial cuando la doc existe', async () => {
      const history = [{ field: 'preoperativeNotes', timestamp: new Date().toISOString() }];
      mockDocumentationRepository.findOne.mockResolvedValue({
        ...mockDocumentation,
        changeHistory: history,
      });

      const result = await service.getChangeHistory(docId);

      expect(result).toEqual(history);
    });

    it('debería lanzar NotFoundException cuando la documentación no existe', async () => {
      mockDocumentationRepository.findOne.mockResolvedValue(null);

      await expect(service.getChangeHistory(docId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getVersionHistory', () => {
    it('debería devolver lista de versiones ordenadas por createdAt DESC', async () => {
      mockDocumentationRepository.findOne.mockResolvedValue(mockDocumentation);
      const versions = [
        { id: uuidv4(), versionNumber: 2, createdAt: new Date('2025-01-02') },
        { id: uuidv4(), versionNumber: 1, createdAt: new Date('2025-01-01') },
      ];
      mockDocumentationVersionRepository.find.mockResolvedValue(versions);

      const result = await service.getVersionHistory(docId);

      expect(result).toEqual(versions);
      expect(mockDocumentationVersionRepository.find).toHaveBeenCalledWith({
        where: { documentationId: docId },
        order: { createdAt: 'DESC' },
      });
    });

    it('debería lanzar NotFoundException cuando la documentación no existe', async () => {
      mockDocumentationRepository.findOne.mockResolvedValue(null);

      await expect(service.getVersionHistory(docId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('complete', () => {
    it('debería marcar como completada cuando la doc existe', async () => {
      mockDocumentationRepository.findOne.mockResolvedValue(mockDocumentation);
      mockDocumentationRepository.save.mockResolvedValue({
        ...mockDocumentation,
        status: DocumentationStatus.COMPLETED,
      });

      const result = await service.complete(docId, userId);

      expect(mockDocumentationRepository.save).toHaveBeenCalled();
      expect(result.status).toBe(DocumentationStatus.COMPLETED);
    });

    it('debería lanzar NotFoundException cuando la documentación no existe', async () => {
      mockDocumentationRepository.findOne.mockResolvedValue(null);

      await expect(service.complete(docId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('autoSave', () => {
    it('debería guardar cuando la documentación existe', async () => {
      mockDocumentationRepository.findOne.mockResolvedValue(mockDocumentation);
      mockDocumentationRepository.save.mockResolvedValue(mockDocumentation);

      await service.autoSave(docId, { preoperativeNotes: 'Auto' });

      expect(mockDocumentationRepository.save).toHaveBeenCalled();
    });

    it('no debería lanzar cuando la documentación no existe', async () => {
      mockDocumentationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.autoSave(docId, { preoperativeNotes: 'x' }),
      ).resolves.not.toThrow();
      expect(mockDocumentationRepository.save).not.toHaveBeenCalled();
    });
  });
});
