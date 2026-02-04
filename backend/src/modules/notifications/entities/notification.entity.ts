import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum NotificationType {
  STAFF_ASSIGNMENT = 'staff_assignment',
  SURGERY_SCHEDULED = 'surgery_scheduled',
  SURGERY_CANCELLED = 'surgery_cancelled',
  CHECKLIST_REMINDER = 'checklist_reminder',
  OTHER = 'other',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'uuid', name: 'related_id', nullable: true })
  relatedId: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true, name: 'related_type' })
  relatedType: string | null;

  @Column({ type: 'timestamp', name: 'read_at', nullable: true })
  readAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
