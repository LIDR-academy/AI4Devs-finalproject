import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../hce/entities/patient.entity';
import { SurgicalPlanning } from './surgical-planning.entity';
import { Checklist } from './checklist.entity';
import { OperatingRoom } from './operating-room.entity';

export enum SurgeryStatus {
  PLANNED = 'planned',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SurgeryType {
  ELECTIVE = 'elective',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}

@Entity('surgeries')
export class Surgery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient, { nullable: false })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'uuid', name: 'surgeon_id' })
  surgeonId: string; // ID del cirujano (usuario)

  @Column({ type: 'varchar', length: 200 })
  procedure: string; // Nombre del procedimiento quirúrgico

  @Column({ type: 'enum', enum: SurgeryType, default: SurgeryType.ELECTIVE })
  type: SurgeryType;

  @Column({ type: 'enum', enum: SurgeryStatus, default: SurgeryStatus.PLANNED })
  status: SurgeryStatus;

  @Column({ type: 'timestamp', name: 'scheduled_date', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'timestamp', name: 'start_time', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', name: 'end_time', nullable: true })
  endTime: Date;

  @Column({ type: 'uuid', name: 'operating_room_id', nullable: true })
  operatingRoomId: string;

  @ManyToOne(() => OperatingRoom, { nullable: true })
  @JoinColumn({ name: 'operating_room_id' })
  operatingRoom: OperatingRoom;

  @Column({ type: 'text', nullable: true, name: 'preop_notes' })
  preopNotes: string;

  @Column({ type: 'text', nullable: true, name: 'postop_notes' })
  postopNotes: string;

  @Column({ type: 'jsonb', nullable: true, name: 'risk_scores' })
  riskScores: {
    asa?: number; // ASA Physical Status Classification
    possum?: number; // POSSUM score
    custom?: number; // Score personalizado
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @OneToOne(() => SurgicalPlanning, (planning) => planning.surgery)
  planning: SurgicalPlanning;

  @OneToOne(() => Checklist, (checklist) => checklist.surgery)
  checklist: Checklist;
}
