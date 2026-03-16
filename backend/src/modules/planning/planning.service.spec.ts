import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PlanningService } from './planning.service';
import { Surgery, SurgeryStatus } from './entities/surgery.entity';
import { SurgicalPlanning } from './entities/surgical-planning.entity';
import { DicomImage } from './entities/dicom-image.entity';
import { Patient } from '../hce/entities/patient.entity';
import { MetricsService } from '../monitoring/metrics.service';
import { CreateSurgeryDto } from './dto/create-surgery.dto';
import { UpdateSurgeryDto } from './dto/update-surgery.dto';
import { SurgeryType } from './entities/surgery.entity';
import { v4 as uuidv4 } from 'uuid';

describe('PlanningService', () => {
  let service: PlanningService;
  let surgeryRepository: Repository<Surgery>;
  let patientRepository: Repository<Patient>;
  let metricsService: MetricsService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getManyAndCount: jest.fn(),
  };
  const mockSurgeryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockPlanningRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockDicomImageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockPatientRepository = {
    findOne: jest.fn(),
  };

  const mockMetricsService = {
    recordSurgeryCreated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanningService,
        {
          provide: getRepositoryToken(Surgery),
          useValue: mockSurgeryRepository,
        },
        {
          provide: getRepositoryToken(SurgicalPlanning),
          useValue: mockPlanningRepository,
        },
        {
          provide: getRepositoryToken(DicomImage),
          useValue: mockDicomImageRepository,
        },
        {
          provide: getRepositoryToken(Patient),
          useValue: mockPatientRepository,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<PlanningService>(PlanningService);
    surgeryRepository = module.get<Repository<Surgery>>(getRepositoryToken(Surgery));
    patientRepository = module.get<Repository<Patient>>(getRepositoryToken(Patient));
    metricsService = module.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('createSurgery', () => {
    const surgeonId = uuidv4();
    const patientId = uuidv4();
    const createSurgeryDto: CreateSurgeryDto = {
      patientId,
      procedure: 'Cirugía de prueba',
      type: SurgeryType.ELECTIVE,
      scheduledDate: '2024-12-31T10:00:00Z',
    };

    it('debería crear una cirugía exitosamente', async () => {
      const surgeryId = uuidv4();
      const patient = { id: patientId, firstName: 'Juan', lastName: 'Pérez' };
      const savedSurgery = {
        id: surgeryId,
        ...createSurgeryDto,
        surgeonId,
        status: SurgeryStatus.PLANNED,
        scheduledDate: new Date(createSurgeryDto.scheduledDate!),
      };

      mockPatientRepository.findOne.mockResolvedValue(patient);
      mockSurgeryRepository.create.mockReturnValue(savedSurgery);
      mockSurgeryRepository.save.mockResolvedValue(savedSurgery);

      const result = await service.createSurgery(createSurgeryDto, surgeonId);

      expect(result).toBeDefined();
      expect(result.id).toBe(surgeryId);
      expect(result.status).toBe(SurgeryStatus.PLANNED);
      expect(mockMetricsService.recordSurgeryCreated).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el paciente no existe', async () => {
      mockPatientRepository.findOne.mockResolvedValue(null);

      await expect(service.createSurgery(createSurgeryDto, surgeonId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería lanzar BadRequestException si endTime <= startTime', async () => {
      const dtoWithTimes = {
        ...createSurgeryDto,
        operatingRoomId: uuidv4(),
        startTime: '2024-02-15T10:00:00.000Z',
        endTime: '2024-02-15T10:00:00.000Z',
      };
      mockPatientRepository.findOne.mockResolvedValue({ id: patientId });

      await expect(service.createSurgery(dtoWithTimes, surgeonId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createSurgery(dtoWithTimes, surgeonId)).rejects.toThrow(
        'hora de fin debe ser posterior',
      );
    });

    it('debería lanzar BadRequestException si hay conflicto de horario en el quirófano', async () => {
      const roomId = uuidv4();
      const dtoWithRoomAndTimes = {
        ...createSurgeryDto,
        operatingRoomId: roomId,
        startTime: '2024-02-15T10:00:00.000Z',
        endTime: '2024-02-15T12:00:00.000Z',
      };
      mockPatientRepository.findOne.mockResolvedValue({ id: patientId });
      const overlappingSurgery = {
        id: uuidv4(),
        operatingRoomId: roomId,
        startTime: new Date('2024-02-15T11:00:00.000Z'),
        endTime: new Date('2024-02-15T13:00:00.000Z'),
        status: SurgeryStatus.SCHEDULED,
      };
      mockQueryBuilder.getMany.mockResolvedValue([overlappingSurgery]);
      mockSurgeryRepository.create.mockImplementation((entity) => entity);

      await expect(
        service.createSurgery(dtoWithRoomAndTimes, surgeonId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createSurgery(dtoWithRoomAndTimes, surgeonId),
      ).rejects.toThrow('Conflicto de horario');
    });
  });

  describe('findSurgeryById', () => {
    it('debería retornar una cirugía si existe', async () => {
      const surgeryId = uuidv4();
      const surgery = {
        id: surgeryId,
        procedure: 'Cirugía de prueba',
        status: SurgeryStatus.PLANNED,
      };

      mockSurgeryRepository.findOne.mockResolvedValue(surgery);

      const result = await service.findSurgeryById(surgeryId);

      expect(result).toEqual(surgery);
      expect(mockSurgeryRepository.findOne).toHaveBeenCalledWith({
        where: { id: surgeryId },
        relations: ['patient', 'planning', 'planning.dicomImages', 'checklist', 'operatingRoom'],
      });
    });

    it('debería lanzar NotFoundException si la cirugía no existe', async () => {
      const surgeryId = uuidv4();

      mockSurgeryRepository.findOne.mockResolvedValue(null);

      await expect(service.findSurgeryById(surgeryId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRoomAvailability', () => {
    it('debería devolver lista de cirugías en el rango para el quirófano', async () => {
      const roomId = uuidv4();
      const from = new Date('2024-02-01T00:00:00.000Z');
      const to = new Date('2024-02-28T23:59:59.999Z');
      const surgeries = [
        {
          id: uuidv4(),
          operatingRoomId: roomId,
          startTime: new Date('2024-02-15T10:00:00.000Z'),
          endTime: new Date('2024-02-15T12:00:00.000Z'),
          procedure: 'Colecistectomía',
        },
      ];
      mockQueryBuilder.getMany.mockResolvedValueOnce(surgeries);

      const result = await service.getRoomAvailability(roomId, from, to);

      expect(result).toEqual(surgeries);
      expect(mockSurgeryRepository.createQueryBuilder).toHaveBeenCalledWith('s');
    });
  });

  describe('getSurgicalGuide', () => {
    it('debería devolver guía con procedimiento y pasos cuando existe cirugía y planificación', async () => {
      const surgeryId = uuidv4();
      const surgery = {
        id: surgeryId,
        procedure: 'Colecistectomía laparoscópica',
        type: 'ELECTIVE',
        riskScores: { asa: 2, possum: 12 },
      };
      const planning = {
        id: uuidv4(),
        surgeryId,
        approachSelected: 'Laparoscopia',
        planningNotes: 'Paciente con antecedentes de colecistitis',
        dicomImages: [{ id: uuidv4() }, { id: uuidv4() }],
        simulationData: { estimatedDuration: 90 },
      };
      mockSurgeryRepository.findOne.mockResolvedValue(surgery);
      mockPlanningRepository.findOne.mockResolvedValue(planning);

      const result = await service.getSurgicalGuide(surgeryId);

      expect(result.surgeryId).toBe(surgeryId);
      expect(result.procedure).toBe('Colecistectomía laparoscópica');
      expect(result.approach).toBe('Laparoscopia');
      expect(result.steps).toHaveLength(6);
      expect(result.riskScores).toEqual({ asa: 2, possum: 12 });
      expect(result.dicomImageCount).toBe(2);
      expect(result.estimatedDurationMinutes).toBe(90);
    });

    it('debería devolver guía sin planificación cuando no existe planning', async () => {
      const surgeryId = uuidv4();
      const surgery = { id: surgeryId, procedure: 'Artroscopia', type: 'ELECTIVE' };
      mockSurgeryRepository.findOne.mockResolvedValue(surgery);
      mockPlanningRepository.findOne.mockResolvedValue(null);

      const result = await service.getSurgicalGuide(surgeryId);

      expect(result.procedure).toBe('Artroscopia');
      expect(result.approach).toBeNull();
      expect(result.planningNotes).toBeNull();
      expect(result.dicomImageCount).toBe(0);
      expect(result.estimatedDurationMinutes).toBeNull();
    });

    it('debería lanzar NotFoundException si la cirugía no existe', async () => {
      mockSurgeryRepository.findOne.mockResolvedValue(null);

      await expect(service.getSurgicalGuide(uuidv4())).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSurgeryStatus', () => {
    it('debería actualizar el estado de una cirugía', async () => {
      const surgeryId = uuidv4();
      const existingSurgery = {
        id: surgeryId,
        status: SurgeryStatus.PLANNED,
        procedure: 'Cirugía de prueba',
      };

      mockSurgeryRepository.findOne.mockResolvedValue(existingSurgery);
      mockSurgeryRepository.save.mockResolvedValue({
        ...existingSurgery,
        status: SurgeryStatus.IN_PROGRESS,
      });

      const result = await service.updateSurgeryStatus(surgeryId, SurgeryStatus.IN_PROGRESS);

      expect(result.status).toBe(SurgeryStatus.IN_PROGRESS);
      expect(mockSurgeryRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si la cirugía no existe', async () => {
      const surgeryId = uuidv4();

      mockSurgeryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateSurgeryStatus(surgeryId, SurgeryStatus.IN_PROGRESS),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
