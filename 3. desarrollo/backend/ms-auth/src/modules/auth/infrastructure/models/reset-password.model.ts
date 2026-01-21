import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UsuarioModel } from './usuario.model';

/**
 * Modelo TypeORM para la tabla rrfpwrst
 * Representa los tokens de recuperación de contraseña
 */
@Entity('rrfpwrst')
export class ResetPasswordModel {
  @PrimaryGeneratedColumn({ name: 'pwrst_cod_pwrst' })
  id: number;

  @Column({ name: 'pwrst_hsh_token', length: 255, unique: true })
  tokenHash: string;

  @Column({ name: 'pwrst_cod_usuar' })
  usuarioId: number;

  @Column({ name: 'pwrst_fec_expir', type: 'timestamp' })
  fechaExpiracion: Date;

  @Column({ name: 'pwrst_ctr_usado', default: false })
  usado: boolean;

  @Column({ name: 'pwrst_fec_usado', type: 'timestamp', nullable: true })
  fechaUso: Date | null;

  @Column({ name: 'pwrst_dir_ipreq', type: 'inet' })
  ipRequest: string;

  @Column({ name: 'pwrst_fec_creac', type: 'timestamp', default: () => 'NOW()' })
  fechaCreacion: Date;

  // Relations
  @ManyToOne(() => UsuarioModel)
  @JoinColumn({ name: 'pwrst_cod_usuar' })
  usuario: UsuarioModel;
}

