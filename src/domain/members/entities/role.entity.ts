import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Member } from './member.entity';
import { AdminUser } from './admin-user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  role_id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  role_name!: string;

  @Column({ type: 'jsonb', default: {} })
  permissions!: Record<string, any>;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Member, (member) => member.role)
  members!: Member[];

  @OneToMany(() => AdminUser, (adminUser) => adminUser.role)
  admin_users!: AdminUser[];
}
