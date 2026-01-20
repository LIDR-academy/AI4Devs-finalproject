import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Surgery } from './surgery.entity';

@Entity('operating_rooms')
export class OperatingRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; // Ej: "Quirófano 1", "Sala de Cirugía A"

  @Column({ type: 'varchar', length: 50, nullable: true })
  code: string; // Código único: "Q1", "SC-A"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  floor: string; // Piso: "Planta 2", "Piso 3"

  @Column({ type: 'varchar', length: 50, nullable: true })
  building: string; // Edificio: "Edificio Principal", "Torre Norte"

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Si está disponible para uso

  @Column({ type: 'jsonb', nullable: true })
  equipment: {
    // Equipamiento disponible
    anesthesiaMachine?: boolean;
    ventilator?: boolean;
    monitoringSystem?: boolean;
    surgicalLights?: number;
    [key: string]: any;
  };

  @Column({ type: 'integer', nullable: true })
  capacity: number; // Capacidad máxima de personas

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => Surgery, (surgery) => surgery.operatingRoomId)
  surgeries: Surgery[];
}
