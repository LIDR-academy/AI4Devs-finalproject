import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { Equipment } from './entities/equipment.entity';
import { StaffAssignment } from './entities/staff-assignment.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { PlanningService } from '../planning/planning.service';
import { CreateStaffAssignmentDto } from './dto/create-staff-assignment.dto';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { v4 as uuidv4 } from 'uuid';

describe('ResourcesService', () => {
  let service: ResourcesService;
  let staffAssignmentRepository: Repository<StaffAssignment>;
  let equipmentRepository: Repository<Equipment>;
  let notificationsService: NotificationsService;
  let planningService: PlanningService;

  const surgeryId = uuidv4();
  const userId = uuidv4();
  const assignmentId = uuidv4();
  const equipmentId = uuidv4();

  const mockStaffAssignment = {
    id: assignmentId,
    surgeryId,
    userId,
    role: 'surgeon',
    notes: null,
    assignedAt: new Date(),
    createdAt: new Date(),
  } as StaffAssignment;

  const mockEquipment = {
    id: equipmentId,
    name: 'Monitor',
    code: 'MON-01',
    type: 'monitoring',
    operatingRoomId: null,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Equipment;

  const mockStaffRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockEquipmentRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
    remove: jest.fn(),
  };

  const mockNotificationsService = {
    notifyStaffAssignment: jest.fn().mockResolvedValue(undefined),
  };

  const mockPlanningService = {
    findSurgeryById: jest.fn().mockResolvedValue({ id: surgeryId, procedure: 'Colecistectomía' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        { provide: getRepositoryToken(StaffAssignment), useValue: mockStaffRepo },
        { provide: getRepositoryToken(Equipment), useValue: mockEquipmentRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: PlanningService, useValue: mockPlanningService },
      ],
    }).compile();

    service = module.get<ResourcesService>(ResourcesService);
    staffAssignmentRepository = module.get(getRepositoryToken(StaffAssignment));
    equipmentRepository = module.get(getRepositoryToken(Equipment));
    notificationsService = module.get(NotificationsService);
    planningService = module.get(PlanningService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('createStaffAssignment', () => {
    const dto: CreateStaffAssignmentDto = {
      surgeryId,
      userId,
      role: 'surgeon',
    };

    it('debería crear asignación y enviar notificación', async () => {
      mockStaffRepo.create.mockReturnValue(mockStaffAssignment);
      mockStaffRepo.save.mockResolvedValue(mockStaffAssignment);

      const result = await service.createStaffAssignment(dto);

      expect(mockStaffRepo.create).toHaveBeenCalledWith({
        surgeryId: dto.surgeryId,
        userId: dto.userId,
        role: dto.role,
        notes: dto.notes,
      });
      expect(mockStaffRepo.save).toHaveBeenCalled();
      expect(mockPlanningService.findSurgeryById).toHaveBeenCalledWith(surgeryId);
      expect(mockNotificationsService.notifyStaffAssignment).toHaveBeenCalledWith(
        userId,
        surgeryId,
        'Colecistectomía',
        'surgeon',
      );
      expect(result).toEqual(mockStaffAssignment);
    });
  });

  describe('findAssignmentsBySurgery', () => {
    it('debería devolver asignaciones de la cirugía', async () => {
      mockStaffRepo.find.mockResolvedValue([mockStaffAssignment]);

      const result = await service.findAssignmentsBySurgery(surgeryId);

      expect(mockStaffRepo.find).toHaveBeenCalledWith({
        where: { surgeryId },
        order: { assignedAt: 'ASC' },
      });
      expect(result).toEqual([mockStaffAssignment]);
    });
  });

  describe('findAssignmentsByUser', () => {
    it('debería devolver asignaciones del usuario', async () => {
      mockStaffRepo.find.mockResolvedValue([mockStaffAssignment]);

      const result = await service.findAssignmentsByUser(userId);

      expect(mockStaffRepo.find).toHaveBeenCalledWith({
        where: { userId },
        order: { assignedAt: 'DESC' },
      });
      expect(result).toEqual([mockStaffAssignment]);
    });
  });

  describe('removeStaffAssignment', () => {
    it('debería eliminar la asignación', async () => {
      mockStaffRepo.findOne.mockResolvedValue(mockStaffAssignment);
      mockStaffRepo.remove.mockResolvedValue(undefined);

      await service.removeStaffAssignment(assignmentId);

      expect(mockStaffRepo.findOne).toHaveBeenCalledWith({ where: { id: assignmentId } });
      expect(mockStaffRepo.remove).toHaveBeenCalledWith(mockStaffAssignment);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      mockStaffRepo.findOne.mockResolvedValue(null);

      await expect(service.removeStaffAssignment(assignmentId)).rejects.toThrow(NotFoundException);
      expect(mockStaffRepo.remove).not.toHaveBeenCalled();
    });
  });

  describe('createEquipment', () => {
    const dto: CreateEquipmentDto = { name: 'Monitor', code: 'MON-01' };

    it('debería crear equipo', async () => {
      mockEquipmentRepo.create.mockReturnValue(mockEquipment);
      mockEquipmentRepo.save.mockResolvedValue(mockEquipment);

      const result = await service.createEquipment(dto);

      expect(mockEquipmentRepo.create).toHaveBeenCalledWith(dto);
      expect(mockEquipmentRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEquipment);
    });
  });

  describe('findAllEquipment', () => {
    it('debería devolver todos los equipos ordenados', async () => {
      const qb = {
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockEquipment]),
      };
      mockEquipmentRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAllEquipment();

      expect(qb.orderBy).toHaveBeenCalledWith('e.name', 'ASC');
      expect(result).toEqual([mockEquipment]);
    });

    it('debería filtrar por operatingRoomId y availableOnly', async () => {
      const roomId = uuidv4();
      const qb = {
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockEquipmentRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAllEquipment(roomId, true);

      expect(qb.andWhere).toHaveBeenCalledWith('e.operating_room_id = :roomId', { roomId });
      expect(qb.andWhere).toHaveBeenCalledWith('e.is_available = :avail', { avail: true });
    });
  });

  describe('findEquipmentById', () => {
    it('debería devolver el equipo cuando existe', async () => {
      mockEquipmentRepo.findOne.mockResolvedValue(mockEquipment);

      const result = await service.findEquipmentById(equipmentId);

      expect(result).toEqual(mockEquipment);
    });

    it('debería lanzar NotFoundException cuando no existe', async () => {
      mockEquipmentRepo.findOne.mockResolvedValue(null);

      await expect(service.findEquipmentById(equipmentId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateEquipment', () => {
    const dto: UpdateEquipmentDto = { name: 'Monitor actualizado' };

    it('debería actualizar el equipo', async () => {
      mockEquipmentRepo.findOne.mockResolvedValue({ ...mockEquipment });
      mockEquipmentRepo.save.mockResolvedValue({ ...mockEquipment, ...dto });

      const result = await service.updateEquipment(equipmentId, dto);

      expect(mockEquipmentRepo.save).toHaveBeenCalled();
      expect(result.name).toBe(dto.name);
    });
  });

  describe('removeEquipment', () => {
    it('debería eliminar el equipo', async () => {
      mockEquipmentRepo.findOne.mockResolvedValue(mockEquipment);
      mockEquipmentRepo.remove.mockResolvedValue(undefined);

      await service.removeEquipment(equipmentId);

      expect(mockEquipmentRepo.findOne).toHaveBeenCalledWith({ where: { id: equipmentId } });
      expect(mockEquipmentRepo.remove).toHaveBeenCalledWith(mockEquipment);
    });
  });
});
