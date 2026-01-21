import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PerfilModel } from './perfil.model';

/**
 * Modelo TypeORM para la tabla rrfusuar
 * Representa los usuarios del sistema
 */
@Entity('rrfusuar')
export class UsuarioModel {
  @PrimaryGeneratedColumn({ name: 'usuar_cod_usuar' })
  id: number;

  @Column({ name: 'usuar_uuid_usuar', type: 'uuid' })
  uuid: string;

  @Column({ name: 'usuar_nom_usuar', length: 50, unique: true })
  username: string;

  @Column({ name: 'usuar_des_usuar', length: 100 })
  nombreCompleto: string;

  @Column({ name: 'usuar_dir_email', type: 'varchar', length: 150, nullable: true, unique: true })
  email: string | null;

  @Column({ name: 'usuar_pwd_usuar', length: 255 })
  passwordHash: string;

  // Relations
  @Column({ name: 'usuar_cod_empre' })
  empresaId: number;

  @Column({ name: 'usuar_cod_ofici' })
  oficinaId: number;

  @Column({ name: 'usuar_cod_perfi' })
  perfilId: number;

  @Column({ name: 'usuar_cod_emple', type: 'integer', nullable: true })
  empleadoId: number | null;

  // User type
  @Column({ name: 'usuar_tip_usuar', length: 20, default: 'EMPLEADO' })
  tipoUsuario: 'EMPLEADO' | 'EXTERNO' | 'SISTEMA';

  // Special controls
  @Column({ name: 'usuar_ctr_admin', default: false })
  esAdmin: boolean;

  @Column({ name: 'usuar_ctr_globa', default: false })
  accesoGlobal: boolean;

  // Password control
  @Column({ name: 'usuar_fec_ultpw', type: 'timestamp', default: () => 'NOW()' })
  fechaUltimoPassword: Date;

  @Column({ name: 'usuar_ctr_frzpw', default: false })
  forzarCambioPassword: boolean;

  @Column({ name: 'usuar_ctr_nexpw', default: false })
  passwordNuncaExpira: boolean;

  // Access control
  @Column({ name: 'usuar_num_intfa', default: 0 })
  intentosFallidos: number;

  @Column({ name: 'usuar_fec_prifa', type: 'timestamp', nullable: true })
  fechaPrimerIntentoFallido: Date | null;

  @Column({ name: 'usuar_fec_bloqu', type: 'timestamp', nullable: true })
  bloqueadoHasta: Date | null;

  @Column({ name: 'usuar_mot_bloqu', type: 'varchar', length: 100, nullable: true })
  motivoBloqueo: string | null;

  // Activity
  @Column({ name: 'usuar_fec_ultin', type: 'timestamp', nullable: true })
  fechaUltimoLogin: Date | null;

  @Column({ name: 'usuar_dir_ultip', type: 'inet', nullable: true })
  ultimaIpLogin: string | null;

  // MFA
  @Column({ name: 'usuar_ctr_mfaac', default: false })
  mfaActivado: boolean;

  @Column({ name: 'usuar_sec_mfatk', type: 'varchar', length: 255, nullable: true })
  totpSecret: string | null;

  // Status
  @Column({ name: 'usuar_ctr_activ', default: true })
  activo: boolean;

  @Column({ name: 'usuar_ctr_siste', default: false })
  esSistema: boolean;

  @Column({ name: 'usuar_fec_elimi', type: 'timestamp', nullable: true })
  fechaEliminacion: Date | null;

  // Relations
  @ManyToOne(() => PerfilModel)
  @JoinColumn({ name: 'usuar_cod_perfi' })
  perfil: PerfilModel;
}

