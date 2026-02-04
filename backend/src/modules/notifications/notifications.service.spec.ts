import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from './entities/notification.entity';
import { v4 as uuidv4 } from 'uuid';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: Repository<Notification>;

  const userId = uuidv4();
  const notificationId = uuidv4();
  const mockNotification = {
    id: notificationId,
    userId,
    type: NotificationType.STAFF_ASSIGNMENT,
    title: 'Asignación a cirugía',
    message: 'Has sido asignado/a como cirujano.',
    relatedId: uuidv4(),
    relatedType: 'surgery',
    readAt: null,
    createdAt: new Date(),
  } as Notification;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
    update: jest.fn(),
    set: jest.fn(),
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepository = module.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      userId,
      type: NotificationType.STAFF_ASSIGNMENT,
      title: 'Test',
      message: 'Mensaje',
    };

    it('debería crear una notificación', async () => {
      mockRepository.create.mockReturnValue(mockNotification);
      mockRepository.save.mockResolvedValue(mockNotification);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockNotification);
    });
  });

  describe('notifyStaffAssignment', () => {
    const surgeryId = uuidv4();
    const procedureName = 'Colecistectomía';
    const role = 'cirujano';

    it('debería crear notificación de asignación', async () => {
      mockRepository.create.mockReturnValue(mockNotification);
      mockRepository.save.mockResolvedValue(mockNotification);

      const result = await service.notifyStaffAssignment(
        userId,
        surgeryId,
        procedureName,
        role,
      );

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        type: NotificationType.STAFF_ASSIGNMENT,
        title: 'Asignación a cirugía',
        message: `Has sido asignado/a como ${role} a la cirugía: ${procedureName}.`,
        relatedId: surgeryId,
        relatedType: 'surgery',
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockNotification);
    });
  });

  describe('findByUser', () => {
    it('debería devolver notificaciones del usuario (todas)', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockNotification]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findByUser(userId);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('n');
      expect(qb.where).toHaveBeenCalledWith('n.user_id = :userId', { userId });
      expect(qb.orderBy).toHaveBeenCalledWith('n.created_at', 'DESC');
      expect(qb.andWhere).not.toHaveBeenCalled();
      expect(result).toEqual([mockNotification]);
    });

    it('debería filtrar solo no leídas cuando unreadOnly es true', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockNotification]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      await service.findByUser(userId, true);

      expect(qb.andWhere).toHaveBeenCalledWith('n.read_at IS NULL');
    });
  });

  describe('markAsRead', () => {
    it('debería marcar una notificación como leída', async () => {
      const updated = { ...mockNotification, readAt: new Date() };
      mockRepository.findOne.mockResolvedValue(mockNotification);
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.markAsRead(notificationId, userId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: notificationId, userId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ readAt: expect.any(Date) }),
      );
      expect(result.readAt).toBeDefined();
    });

    it('debería lanzar NotFoundException si la notificación no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.markAsRead(notificationId, userId),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('debería marcar todas como leídas y devolver el conteo', async () => {
      const qb = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 5 }),
      };
      (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.markAllAsRead(userId);

      expect(qb.update).toHaveBeenCalledWith(Notification);
      expect(qb.set).toHaveBeenCalledWith({ readAt: expect.any(Date) });
      expect(qb.where).toHaveBeenCalledWith('user_id = :userId', { userId });
      expect(qb.andWhere).toHaveBeenCalledWith('read_at IS NULL');
      expect(result).toEqual({ count: 5 });
    });

    it('debería devolver count 0 cuando no hay filas afectadas', async () => {
      const qb = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: undefined }),
      };
      (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.markAllAsRead(userId);

      expect(result).toEqual({ count: 0 });
    });
  });
});
