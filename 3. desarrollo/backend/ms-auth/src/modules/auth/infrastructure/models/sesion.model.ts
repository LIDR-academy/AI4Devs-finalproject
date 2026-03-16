import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UsuarioModel } from './usuario.model';

/**
 * Modelo TypeORM para la tabla rrfsesio
 * Representa las sesiones activas con refresh tokens
 */
@Entity('rrfsesio')
export class SesionModel {
  @PrimaryGeneratedColumn({ name: 'sesio_cod_sesio' })
  id: number;

  @Column({ name: 'sesio_uuid_sesio', type: 'uuid', default: () => 'uuid_generate_v4()' })
  uuid: string;

  @Column({ name: 'sesio_cod_usuar' })
  usuarioId: number;

  @Column({ name: 'sesio_hsh_refto', length: 255 })
  refreshTokenHash: string;

  @Column({ name: 'sesio_fam_refto', type: 'uuid', default: () => 'uuid_generate_v4()' })
  tokenFamily: string;

  @Column({ name: 'sesio_dir_iplog', type: 'inet' })
  ipLogin: string;

  @Column({ name: 'sesio_des_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ name: 'sesio_hsh_devic', type: 'varchar', length: 255, nullable: true })
  deviceFingerprint: string | null;

  @Column({ name: 'sesio_nom_devic', type: 'varchar', length: 100, nullable: true })
  deviceName: string | null;

  @Column({ name: 'sesio_ctr_activ', default: true })
  activo: boolean;

  @Column({ name: 'sesio_fec_creac', type: 'timestamp', default: () => 'NOW()' })
  fechaCreacion: Date;

  @Column({ name: 'sesio_fec_expir', type: 'timestamp' })
  fechaExpiracion: Date;

  @Column({ name: 'sesio_fec_ultac', type: 'timestamp', default: () => 'NOW()' })
  fechaUltimaActividad: Date;

  @Column({ name: 'sesio_fec_revoc', type: 'timestamp', nullable: true })
  fechaRevocacion: Date | null;

  @Column({ 
    name: 'sesio_mot_revoc', 
    type: 'varchar',
    length: 50, 
    nullable: true 
  })
  motivoRevocacion: 'LOGOUT' | 'NEW_SESSION' | 'ADMIN' | 'EXPIRED' | 'TOKEN_REUSE' | 'PASSWORD_CHANGE' | null;

  // Relations
  @ManyToOne(() => UsuarioModel)
  @JoinColumn({ name: 'sesio_cod_usuar' })
  usuario: UsuarioModel;
}

