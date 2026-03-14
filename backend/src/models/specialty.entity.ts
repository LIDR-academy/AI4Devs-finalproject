import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  Index,
} from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity('SPECIALTIES')
@Index('IDX_SPECIALTIES_IS_ACTIVE', ['isActive'])
export class Specialty {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'name_es', length: 150 })
  nameEs!: string;

  @Column({ name: 'name_en', length: 150 })
  nameEn!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @ManyToMany(() => Doctor, (doctor) => doctor.specialties)
  doctors!: Doctor[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
