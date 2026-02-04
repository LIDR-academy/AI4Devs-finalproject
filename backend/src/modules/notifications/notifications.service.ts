import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

export interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  message?: string;
  relatedId?: string | null;
  relatedType?: string | null;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(dto);
    return this.notificationRepository.save(notification);
  }

  /** Notificación de confirmación: asignación a cirugía */
  async notifyStaffAssignment(
    userId: string,
    surgeryId: string,
    procedureName: string,
    role: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.STAFF_ASSIGNMENT,
      title: 'Asignación a cirugía',
      message: `Has sido asignado/a como ${role} a la cirugía: ${procedureName}.`,
      relatedId: surgeryId,
      relatedType: 'surgery',
    });
  }

  async findByUser(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    const qb = this.notificationRepository
      .createQueryBuilder('n')
      .where('n.user_id = :userId', { userId })
      .orderBy('n.created_at', 'DESC');
    if (unreadOnly) {
      qb.andWhere('n.read_at IS NULL');
    }
    return qb.getMany();
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ readAt: new Date() })
      .where('user_id = :userId', { userId })
      .andWhere('read_at IS NULL')
      .execute();
    return { count: result.affected ?? 0 };
  }
}
