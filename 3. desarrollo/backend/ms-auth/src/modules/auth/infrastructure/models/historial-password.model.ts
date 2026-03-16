import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UsuarioModel } from './usuario.model';

/**
 * Modelo TypeORM para la tabla rrfhispw
 * Representa el historial de contraseñas para prevenir reutilización
 */
@Entity('rrfhispw')
export class HistorialPasswordModel {
  @PrimaryGeneratedColumn({ name: 'hispw_cod_hispw' })
  id: number;

  @Column({ name: 'hispw_cod_usuar' })
  usuarioId: number;

  @Column({ name: 'hispw_pwd_usuar', length: 255 })
  passwordHash: string;

  @Column({ name: 'hispw_fec_creac', type: 'timestamp', default: () => 'NOW()' })
  fechaCreacion: Date;

  // Relations
  @ManyToOne(() => UsuarioModel)
  @JoinColumn({ name: 'hispw_cod_usuar' })
  usuario: UsuarioModel;
}

