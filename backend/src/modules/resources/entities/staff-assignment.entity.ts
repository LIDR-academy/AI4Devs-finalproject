import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum StaffRole {
  SURGEON = 'surgeon',
  NURSE = 'nurse',
  ANESTHETIST = 'anesthetist',
  ASSISTANT = 'assistant',
  OTHER = 'other',
}

@Entity('staff_assignments')
export class StaffAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'surgery_id' })
  surgeryId: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string; // ID del usuario (cirujano, enfermera, etc.)

  @Column({ type: 'varchar', length: 50 })
  role: string; // StaffRole o texto libre

  @Column({ type: 'timestamp', name: 'assigned_at', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
