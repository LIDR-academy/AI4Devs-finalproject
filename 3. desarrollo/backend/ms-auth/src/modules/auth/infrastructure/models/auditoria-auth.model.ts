import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Modelo TypeORM para la tabla rrfaulog
 * Representa el log de auditoría de autenticación
 */
@Entity('rrfaulog')
export class AuditoriaAuthModel {
  @PrimaryGeneratedColumn({ name: 'aulog_cod_aulog' })
  id: number;

  @Column({ name: 'aulog_uuid_aulog', type: 'uuid', default: () => 'uuid_generate_v4()' })
  uuid: string;

  @Column({ name: 'aulog_tip_event', type: 'varchar', length: 50 })
  tipoEvento: string;

  @Column({ name: 'aulog_cat_event', type: 'varchar', length: 30, default: 'AUTH' })
  categoriaEvento: string;

  @Column({ name: 'aulog_cod_usuar', type: 'integer', nullable: true })
  usuarioId: number | null;

  @Column({ name: 'aulog_nom_usuar', type: 'varchar', length: 100, nullable: true })
  nombreUsuario: string | null;

  @Column({ name: 'aulog_uuid_sesio', type: 'uuid', nullable: true })
  sesionUuid: string | null;

  @Column({ name: 'aulog_dir_iplog', type: 'inet' })
  ipLogin: string;

  @Column({ name: 'aulog_des_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ name: 'aulog_ctr_exito' })
  exito: boolean;

  @Column({ name: 'aulog_mot_error', type: 'varchar', length: 100, nullable: true })
  motivoError: string | null;

  @Column({ name: 'aulog_cod_empre', type: 'integer', nullable: true })
  empresaId: number | null;

  @Column({ name: 'aulog_cod_ofici', type: 'integer', nullable: true })
  oficinaId: number | null;

  @Column({ name: 'aulog_dat_event', type: 'jsonb', default: '{}' })
  datosEvento: Record<string, any>;

  @Column({ name: 'aulog_fec_event', type: 'timestamp', default: () => 'NOW()' })
  fechaEvento: Date;
}

