import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { Checklist } from '../entities/checklist.entity';
import { ChecklistVersion } from '../entities/checklist-version.entity';
import { Surgery } from '../entities/surgery.entity';
import { v4 as uuidv4 } from 'uuid';

describe('ChecklistService', () => {
  let service: ChecklistService;
  let checklistRepository: Repository<Checklist>;
  let surgeryRepository: Repository<Surgery>;

  const surgeryId = uuidv4();
  const userId = uuidv4();
  const checklistId = uuidv4();

  const defaultChecklistData = {
    preInduction: {
      name: 'Sign In',
      items: [
        { id: 'signin-1', text: 'Item 1', checked: false },
        { id: 'signin-2', text: 'Item 2', checked: false },
      ],
      completed: false,
    },
    preIncision: {
      name: 'Time Out',
      items: [
        { id: 'timeout-1', text: 'Item 1', checked: false },
      ],
      completed: false,
    },
    postProcedure: {
      name: 'Sign Out',
      items: [
        { id: 'signout-1', text: 'Item 1', checked: false },
      ],
      completed: false,
    },
  };

  const mockChecklist: Checklist = {
    id: checklistId,
    surgeryId,
    preInductionComplete: false,
    preIncisionComplete: false,
    postProcedureComplete: false,
    checklistData: defaultChecklistData,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Checklist;

  const mockSurgery = { id: surgeryId } as Surgery;

  const mockChecklistRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockSurgeryRepository = {
    findOne: jest.fn(),
  };

  const mockChecklistVersionRepository = {
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn((dto) => ({ ...dto, id: uuidv4() })),
    save: jest.fn((v) => Promise.resolve(v)),
    find: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    mockChecklistVersionRepository.count.mockResolvedValue(0);
    mockChecklistVersionRepository.find.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChecklistService,
        {
          provide: getRepositoryToken(Checklist),
          useValue: mockChecklistRepository,
        },
        {
          provide: getRepositoryToken(ChecklistVersion),
          useValue: mockChecklistVersionRepository,
        },
        {
          provide: getRepositoryToken(Surgery),
          useValue: mockSurgeryRepository,
        },
      ],
    }).compile();

    service = module.get<ChecklistService>(ChecklistService);
    checklistRepository = module.get<Repository<Checklist>>(
      getRepositoryToken(Checklist),
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

  describe('createChecklist', () => {
    it('debería lanzar NotFoundException si la cirugía no existe', async () => {
      mockSurgeryRepository.findOne.mockResolvedValue(null);

      await expect(service.createChecklist(surgeryId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockChecklistRepository.save).not.toHaveBeenCalled();
    });

    it('debería devolver el checklist existente si ya existe', async () => {
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockChecklistRepository.findOne.mockResolvedValue(mockChecklist);

      const result = await service.createChecklist(surgeryId);

      expect(result).toEqual(mockChecklist);
      expect(mockChecklistRepository.save).not.toHaveBeenCalled();
    });

    it('debería crear y guardar un nuevo checklist cuando no existe', async () => {
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockChecklistRepository.findOne.mockResolvedValue(null);
      mockChecklistRepository.create.mockImplementation((entity) => ({
        ...entity,
        id: checklistId,
      }));
      mockChecklistRepository.save.mockResolvedValue(mockChecklist);

      const result = await service.createChecklist(surgeryId);

      expect(mockChecklistRepository.create).toHaveBeenCalled();
      expect(mockChecklistRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getChecklist', () => {
    it('debería devolver el checklist cuando existe', async () => {
      mockChecklistRepository.findOne.mockResolvedValue(mockChecklist);

      const result = await service.getChecklist(surgeryId);

      expect(result).toEqual(mockChecklist);
    });

    it('debería crear y devolver checklist cuando no existe', async () => {
      mockChecklistRepository.findOne.mockResolvedValue(null);
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockChecklistRepository.create.mockImplementation((entity) => ({
        ...entity,
        id: checklistId,
      }));
      mockChecklistRepository.save.mockResolvedValue(mockChecklist);

      const result = await service.getChecklist(surgeryId);

      expect(mockChecklistRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('updateChecklistPhase', () => {
    it('debería actualizar la fase y los flags de completitud', async () => {
      const phaseData = {
        name: 'Sign In',
        items: [
          { id: 'signin-1', text: 'Item 1', checked: true },
          { id: 'signin-2', text: 'Item 2', checked: true },
        ],
        completed: true,
      };
      mockChecklistRepository.findOne.mockResolvedValue({ ...mockChecklist });
      mockChecklistRepository.save.mockResolvedValue({
        ...mockChecklist,
        preInductionComplete: true,
      });

      const result = await service.updateChecklistPhase(
        surgeryId,
        'preInduction',
        phaseData,
        userId,
      );

      expect(mockChecklistRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('toggleChecklistItem', () => {
    it('debería lanzar BadRequestException si la fase no existe', async () => {
      const checklistWithoutPhase = {
        ...mockChecklist,
        checklistData: { preInduction: defaultChecklistData.preInduction },
      };
      mockChecklistRepository.findOne.mockResolvedValue(checklistWithoutPhase);

      await expect(
        service.toggleChecklistItem(
          surgeryId,
          'preIncision',
          'timeout-1',
          true,
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException si el ítem no existe', async () => {
      mockChecklistRepository.findOne.mockResolvedValue({ ...mockChecklist });

      await expect(
        service.toggleChecklistItem(
          surgeryId,
          'preInduction',
          'item-inexistente',
          true,
          userId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería marcar el ítem y actualizar la fase', async () => {
      mockChecklistRepository.findOne.mockResolvedValue({
        ...mockChecklist,
        checklistData: JSON.parse(JSON.stringify(defaultChecklistData)),
      });
      mockChecklistRepository.save.mockResolvedValue(mockChecklist);

      const result = await service.toggleChecklistItem(
        surgeryId,
        'preInduction',
        'signin-1',
        true,
        userId,
      );

      expect(mockChecklistRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('debería desmarcar el ítem y marcar la fase como incompleta si estaba completa', async () => {
      const completedPhase = {
        ...defaultChecklistData.preInduction,
        items: [
          { id: 'signin-1', text: 'Item 1', checked: true },
          { id: 'signin-2', text: 'Item 2', checked: true },
        ],
        completed: true,
      };
      mockChecklistRepository.findOne.mockResolvedValue({
        ...mockChecklist,
        checklistData: {
          ...defaultChecklistData,
          preInduction: completedPhase,
        },
      });
      mockChecklistRepository.save.mockResolvedValue(mockChecklist);

      const result = await service.toggleChecklistItem(
        surgeryId,
        'preInduction',
        'signin-1',
        false,
        userId,
      );

      expect(mockChecklistRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getMissingCriticalItems', () => {
    it('debería devolver ítems no marcados por fase', async () => {
      mockChecklistRepository.findOne.mockResolvedValue(mockChecklist);

      const result = await service.getMissingCriticalItems(surgeryId);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((entry) => {
        expect(entry).toHaveProperty('phase');
        expect(entry).toHaveProperty('missingItems');
        expect(Array.isArray(entry.missingItems)).toBe(true);
      });
    });

    it('debería devolver array vacío cuando todas las fases están completas', async () => {
      const allComplete = {
        ...mockChecklist,
        checklistData: {
          preInduction: {
            ...defaultChecklistData.preInduction,
            items: defaultChecklistData.preInduction.items.map((i) => ({
              ...i,
              checked: true,
            })),
            completed: true,
          },
          preIncision: {
            ...defaultChecklistData.preIncision,
            items: defaultChecklistData.preIncision.items.map((i) => ({
              ...i,
              checked: true,
            })),
            completed: true,
          },
          postProcedure: {
            ...defaultChecklistData.postProcedure,
            items: defaultChecklistData.postProcedure.items.map((i) => ({
              ...i,
              checked: true,
            })),
            completed: true,
          },
        },
      };
      mockChecklistRepository.findOne.mockResolvedValue(allComplete);

      const result = await service.getMissingCriticalItems(surgeryId);

      expect(result).toEqual([]);
    });
  });

  describe('getChecklistHistory', () => {
    it('debería devolver array vacío si no existe checklist para la cirugía', async () => {
      mockChecklistRepository.findOne.mockResolvedValue(null);

      const result = await service.getChecklistHistory(surgeryId);

      expect(result).toEqual([]);
      expect(mockChecklistVersionRepository.find).not.toHaveBeenCalled();
    });

    it('debería devolver versiones ordenadas por createdAt DESC', async () => {
      mockChecklistRepository.findOne.mockResolvedValue(mockChecklist);
      const versions = [
        { id: uuidv4(), versionNumber: 2, phaseUpdated: 'postProcedure', createdAt: new Date('2025-01-02') },
        { id: uuidv4(), versionNumber: 1, phaseUpdated: 'preInduction', createdAt: new Date('2025-01-01') },
      ];
      mockChecklistVersionRepository.find.mockResolvedValue(versions);

      const result = await service.getChecklistHistory(surgeryId);

      expect(result).toEqual(versions);
      expect(mockChecklistVersionRepository.find).toHaveBeenCalledWith({
        where: { checklistId },
        order: { createdAt: 'DESC' },
      });
    });
  });
});
