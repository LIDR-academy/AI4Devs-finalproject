import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SurgicalPlanning } from './surgical-planning.entity';

@Entity('dicom_images')
export class DicomImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'planning_id' })
  planningId: string;

  @ManyToOne(() => SurgicalPlanning, (planning) => planning.dicomImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'planning_id' })
  planning: SurgicalPlanning;

  @Column({ type: 'varchar', length: 500, name: 'orthanc_instance_id' })
  orthancInstanceId: string; // ID de la instancia en Orthanc

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'series_id' })
  seriesId: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'study_id' })
  studyId: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'modality' })
  modality: string; // CT, MRI, X-RAY, etc.

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'description' })
  description: string;

  @Column({ type: 'jsonb', nullable: true, name: 'metadata' })
  metadata: {
    patientName?: string;
    studyDate?: string;
    seriesDescription?: string;
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
