import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Entidad User que representa un usuario del sistema.
 * Extiende BaseEntity para heredar id, timestamps y soft delete.
 */
@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre!: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  @Index()
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;
}
