import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { FollowupService } from './followup.service';
import { PostopEvolution } from './entities/postop-evolution.entity';
import { DischargePlan } from './entities/discharge-plan.entity';
import { Surgery } from '../planning/entities/surgery.entity';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { CreateEvolutionDto } from './dto/create-evolution.dto';
import { CreateDischargePlanDto } from './dto/create-discharge-plan.dto';
import { v4 as uuidv4 } from 'uuid';

describe('FollowupService', () => {
  let service: FollowupService;
  let evolutionRepository: Repository<PostopEvolution>;
  let dischargePlanRepository: Repository<DischargePlan>;
  let surgeryRepository: Repository<Surgery>;
  let pdfGeneratorService: PdfGeneratorService;

  const surgeryId = uuidv4();
  const userId = uuidv4();
  const mockSurgery = {
    id: surgeryId,
    procedure: 'Colecistectomía',
    scheduledDate: new Date('2026-02-10'),
    patient: {},
  } as Surgery;

  const mockEvolutionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDischargePlanRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockSurgeryRepository = {
    findOne: jest.fn(),
  };

  const mockPdfGeneratorService = {
    generateDischargePlanPdf: jest.fn().mockResolvedValue(Buffer.from('pdf')),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowupService,
        {
          provide: getRepositoryToken(PostopEvolution),
          useValue: mockEvolutionRepository,
        },
        {
          provide: getRepositoryToken(DischargePlan),
          useValue: mockDischargePlanRepository,
        },
        {
          provide: getRepositoryToken(Surgery),
          useValue: mockSurgeryRepository,
        },
        {
          provide: PdfGeneratorService,
          useValue: mockPdfGeneratorService,
        },
      ],
    }).compile();

    service = module.get<FollowupService>(FollowupService);
    evolutionRepository = module.get<Repository<PostopEvolution>>(
      getRepositoryToken(PostopEvolution),
    );
    dischargePlanRepository = module.get<Repository<DischargePlan>>(
      getRepositoryToken(DischargePlan),
    );
    surgeryRepository = module.get<Repository<Surgery>>(
      getRepositoryToken(Surgery),
    );
    pdfGeneratorService = module.get<PdfGeneratorService>(PdfGeneratorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('createEvolution', () => {
    const dto: CreateEvolutionDto = {
      surgeryId,
      evolutionDate: '2026-02-03',
      clinicalNotes: 'Evolución favorable',
      hasComplications: false,
    };
    const savedEvolution = { id: uuidv4(), ...dto } as unknown as PostopEvolution;

    it('debería crear una evolución cuando la cirugía existe', async () => {
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockEvolutionRepository.create.mockReturnValue(savedEvolution);
      mockEvolutionRepository.save.mockResolvedValue(savedEvolution);

      const result = await service.createEvolution(dto, userId);

      expect(mockSurgeryRepository.findOne).toHaveBeenCalledWith({
        where: { id: surgeryId },
        relations: ['patient'],
      });
      expect(mockEvolutionRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedEvolution);
    });

    it('debería lanzar NotFoundException si la cirugía no existe', async () => {
      mockSurgeryRepository.findOne.mockResolvedValue(null);

      await expect(service.createEvolution(dto, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockEvolutionRepository.save).not.toHaveBeenCalled();
    });

    it('debería aceptar evolutionDate con hora (ISO) y crear evolución', async () => {
      const dtoWithTime: CreateEvolutionDto = {
        ...dto,
        evolutionDate: '2026-02-03T08:30:00.000Z',
      };
      const saved = { id: uuidv4(), ...dtoWithTime, evolutionDate: new Date(dtoWithTime.evolutionDate) } as unknown as PostopEvolution;
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockEvolutionRepository.create.mockImplementation((entity) => ({ ...entity, id: saved.id }));
      mockEvolutionRepository.save.mockResolvedValue(saved);

      const result = await service.createEvolution(dtoWithTime, userId);

      expect(mockEvolutionRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getEvolutionsBySurgery', () => {
    it('debería devolver la lista de evoluciones', async () => {
      const evolutions = [{ id: uuidv4(), surgeryId }] as PostopEvolution[];
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockEvolutionRepository.find.mockResolvedValue(evolutions);

      const result = await service.getEvolutionsBySurgery(surgeryId);

      expect(result).toEqual(evolutions);
      expect(mockEvolutionRepository.find).toHaveBeenCalledWith({
        where: { surgeryId },
        order: { evolutionDate: 'DESC', createdAt: 'DESC' },
      });
    });

    it('debería lanzar NotFoundException si la cirugía no existe', async () => {
      mockSurgeryRepository.findOne.mockResolvedValue(null);

      await expect(service.getEvolutionsBySurgery(surgeryId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getEvolutionById', () => {
    it('debería devolver la evolución cuando existe', async () => {
      const evolution = { id: uuidv4(), surgeryId } as PostopEvolution;
      mockEvolutionRepository.findOne.mockResolvedValue(evolution);

      const result = await service.getEvolutionById(evolution.id);

      expect(result).toEqual(evolution);
    });

    it('debería lanzar NotFoundException cuando no existe', async () => {
      mockEvolutionRepository.findOne.mockResolvedValue(null);

      await expect(service.getEvolutionById(uuidv4())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getComplicationsAlerts', () => {
    it('debería devolver solo evoluciones con hasComplications true', async () => {
      const withComplications = [
        {
          id: uuidv4(),
          surgeryId,
          hasComplications: true,
          complicationsNotes: 'Fiebre postoperatoria',
        },
      ] as PostopEvolution[];
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockEvolutionRepository.find.mockResolvedValue(withComplications);

      const result = await service.getComplicationsAlerts(surgeryId);

      expect(result).toEqual(withComplications);
      expect(mockEvolutionRepository.find).toHaveBeenCalledWith({
        where: { surgeryId, hasComplications: true },
        order: { evolutionDate: 'DESC' },
      });
    });

    it('debería devolver array vacío cuando no hay complicaciones', async () => {
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockEvolutionRepository.find.mockResolvedValue([]);

      const result = await service.getComplicationsAlerts(surgeryId);

      expect(result).toEqual([]);
    });

    it('debería lanzar NotFoundException si la cirugía no existe', async () => {
      mockSurgeryRepository.findOne.mockResolvedValue(null);

      await expect(service.getComplicationsAlerts(surgeryId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createOrUpdateDischargePlan', () => {
    const dto: CreateDischargePlanDto = {
      surgerySummary: 'Resumen',
      instructions: 'Instrucciones',
    };

    it('debería crear un plan cuando no existe', async () => {
      const newPlan = { id: uuidv4(), surgeryId, status: 'draft' } as DischargePlan;
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockDischargePlanRepository.findOne.mockResolvedValue(null);
      mockDischargePlanRepository.create.mockReturnValue(newPlan);
      mockDischargePlanRepository.save.mockResolvedValue(newPlan);

      const result = await service.createOrUpdateDischargePlan(
        surgeryId,
        dto,
        userId,
      );

      expect(mockDischargePlanRepository.create).toHaveBeenCalled();
      expect(mockDischargePlanRepository.save).toHaveBeenCalled();
      expect(result).toEqual(newPlan);
    });

    it('debería actualizar el plan cuando ya existe', async () => {
      const existingPlan = {
        id: uuidv4(),
        surgeryId,
        status: 'draft',
      } as DischargePlan;
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockDischargePlanRepository.findOne.mockResolvedValue(existingPlan);
      mockDischargePlanRepository.save.mockResolvedValue({
        ...existingPlan,
        ...dto,
      });

      const result = await service.createOrUpdateDischargePlan(
        surgeryId,
        dto,
        userId,
      );

      expect(mockDischargePlanRepository.create).not.toHaveBeenCalled();
      expect(mockDischargePlanRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getDischargePlanBySurgery', () => {
    it('debería devolver el plan cuando existe', async () => {
      const plan = { id: uuidv4(), surgeryId } as DischargePlan;
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockDischargePlanRepository.findOne.mockResolvedValue(plan);

      const result = await service.getDischargePlanBySurgery(surgeryId);

      expect(result).toEqual(plan);
    });

    it('debería devolver null cuando no hay plan', async () => {
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockDischargePlanRepository.findOne.mockResolvedValue(null);

      const result = await service.getDischargePlanBySurgery(surgeryId);

      expect(result).toBeNull();
    });

    it('debería lanzar NotFoundException si la cirugía no existe', async () => {
      mockSurgeryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getDischargePlanBySurgery(surgeryId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('finalizeDischargePlan', () => {
    it('debería finalizar el plan cuando existe', async () => {
      const plan = {
        id: uuidv4(),
        surgeryId,
        status: 'draft',
      } as DischargePlan;
      mockDischargePlanRepository.findOne.mockResolvedValue(plan);
      mockDischargePlanRepository.save.mockResolvedValue({
        ...plan,
        status: 'finalized',
      });

      const result = await service.finalizeDischargePlan(surgeryId, userId);

      expect(result.status).toBe('finalized');
      expect(mockDischargePlanRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException cuando no hay plan', async () => {
      mockDischargePlanRepository.findOne.mockResolvedValue(null);

      await expect(
        service.finalizeDischargePlan(surgeryId, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateDischargePlanFromSurgery', () => {
    it('debería crear un plan cuando no existe', async () => {
      const newPlan = { id: uuidv4(), surgeryId, status: 'draft' } as DischargePlan;
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockDischargePlanRepository.findOne.mockResolvedValue(null);
      mockDischargePlanRepository.create.mockReturnValue(newPlan);
      mockDischargePlanRepository.save.mockResolvedValue(newPlan);

      const result = await service.generateDischargePlanFromSurgery(
        surgeryId,
        userId,
      );

      expect(mockDischargePlanRepository.create).toHaveBeenCalled();
      expect(mockDischargePlanRepository.save).toHaveBeenCalled();
      expect(result).toEqual(newPlan);
    });

    it('debería devolver el plan existente sin crear otro', async () => {
      const existingPlan = {
        id: uuidv4(),
        surgeryId,
        status: 'draft',
      } as DischargePlan;
      mockSurgeryRepository.findOne.mockResolvedValue(mockSurgery);
      mockDischargePlanRepository.findOne.mockResolvedValue(existingPlan);

      const result = await service.generateDischargePlanFromSurgery(
        surgeryId,
        userId,
      );

      expect(result).toEqual(existingPlan);
      expect(mockDischargePlanRepository.create).not.toHaveBeenCalled();
      expect(mockDischargePlanRepository.save).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si la cirugía no existe', async () => {
      mockSurgeryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.generateDischargePlanFromSurgery(surgeryId, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDischargePlanPdfBuffer', () => {
    it('debería devolver el buffer del PDF cuando existe plan', async () => {
      const plan = {
        id: uuidv4(),
        surgeryId,
        surgery: mockSurgery,
      } as DischargePlan;
      const buffer = Buffer.from('pdf-content');
      mockDischargePlanRepository.findOne.mockResolvedValue(plan);
      mockPdfGeneratorService.generateDischargePlanPdf.mockResolvedValue(buffer);

      const result = await service.getDischargePlanPdfBuffer(surgeryId);

      expect(result).toEqual(buffer);
      expect(mockPdfGeneratorService.generateDischargePlanPdf).toHaveBeenCalledWith(
        plan,
      );
    });

    it('debería lanzar NotFoundException cuando no hay plan', async () => {
      mockDischargePlanRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getDischargePlanPdfBuffer(surgeryId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
