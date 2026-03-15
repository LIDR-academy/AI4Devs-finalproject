import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Surgery } from './surgery.entity';
import { DicomImage } from './dicom-image.entity';

@Entity('surgical_plannings')
export class SurgicalPlanning {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'surgery_id', unique: true })
  surgeryId: string;

  @OneToOne(() => Surgery, (surgery) => surgery.planning)
  @JoinColumn({ name: 'surgery_id' })
  surgery: Surgery;

  @Column({ type: 'jsonb', nullable: true, name: 'analysis_data' })
  analysisData: {
    measurements?: {
      distance?: number;
      volume?: number;
      area?: number;
      [key: string]: any;
    };
    structures?: {
      name: string;
      coordinates: number[][];
      type: string;
    }[];
    findings?: string[];
  };

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'approach_selected' })
  approachSelected: string; // Abordaje quirúrgico seleccionado

  @Column({ type: 'jsonb', nullable: true, name: 'simulation_data' })
  simulationData: {
    approach?: {
      entryPoint: number[];
      direction: number[];
      angle: number;
    };
    trajectory?: number[][];
    riskZones?: {
      name: string;
      coordinates: number[][];
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    }[];
    estimatedDuration?: number; // minutos
  };

  @Column({ type: 'uuid', nullable: true, name: 'guide_3d_id' })
  guide3dId: string; // Referencia a guía 3D generada (almacenada en MinIO)

  @Column({ type: 'text', nullable: true, name: 'planning_notes' })
  planningNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => DicomImage, (dicomImage) => dicomImage.planning)
  dicomImages: DicomImage[];
}
