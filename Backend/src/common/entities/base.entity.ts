import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
 * Entidad base que proporciona campos comunes a todas las entidades del sistema.
 * Incluye soporte para Soft Delete mediante la columna deleted_at.
 *
 * Todas las entidades del dominio deben extender esta clase para:
 * - Heredar automáticamente Soft Delete
 * - Tener timestamps de auditoría (created_at, updated_at)
 * - Usar UUIDs como identificadores primarios
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt!: Date | null;
}
