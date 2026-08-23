import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { AdminUser } from './admin-user.entity';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  member_id!: string;

  @Column({ type: 'uuid' })
  role_id!: string;

  @ManyToOne(() => Role, (role) => role.members, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash!: string;

  @Column({ type: 'varchar', length: 100 })
  first_name!: string;

  @Column({ type: 'varchar', length: 100 })
  last_name!: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  dni?: string;

  @Column({ type: 'date', nullable: true })
  birth_date?: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  postal_code?: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  membership_number?: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status!: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at?: Date;

  @OneToMany(() => AdminUser, (adminUser) => adminUser.member)
  admin_users!: AdminUser[];
}
