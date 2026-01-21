import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Modelo TypeORM para la tabla rrfperfi
 * Representa los perfiles de usuario con políticas de seguridad
 */
@Entity('rrfperfi')
export class PerfilModel {
  @PrimaryGeneratedColumn({ name: 'perfi_cod_perfi' })
  id: number;

  @Column({ name: 'perfi_nom_perfi', length: 60, unique: true })
  nombre: string;

  @Column({ name: 'perfi_des_perfi', type: 'varchar', length: 255, nullable: true })
  descripcion: string | null;

  // JWT Token Config
  @Column({ name: 'perfi_min_acctk', default: 15 })
  accessTokenMinutes: number;

  @Column({ name: 'perfi_dia_rfrtk', default: 7 })
  refreshTokenDays: number;

  // Password Policy
  @Column({ name: 'perfi_min_lngpw', default: 8 })
  minPasswordLength: number;

  @Column({ name: 'perfi_max_lngpw', default: 128 })
  maxPasswordLength: number;

  @Column({ name: 'perfi_ctr_mayus', default: true })
  requiereMayuscula: boolean;

  @Column({ name: 'perfi_ctr_minus', default: true })
  requiereMinuscula: boolean;

  @Column({ name: 'perfi_ctr_numer', default: true })
  requiereNumero: boolean;

  @Column({ name: 'perfi_ctr_espec', default: true })
  requiereEspecial: boolean;

  @Column({ name: 'perfi_dia_vigpw', default: 90 })
  diasVigenciaPassword: number;

  @Column({ name: 'perfi_num_hispw', default: 5 })
  historialPasswordCount: number;

  // Lockout Policy
  @Column({ name: 'perfi_num_maxin', default: 5 })
  maxIntentosFallidos: number;

  @Column({ name: 'perfi_min_bloqu', default: 30 })
  minutosBloqueo: number;

  @Column({ name: 'perfi_min_venta', default: 15 })
  ventanaMinutos: number;

  // Session Policy
  @Column({ name: 'perfi_ctr_unise', default: true })
  sesionUnica: boolean;

  @Column({ name: 'perfi_min_timeo', default: 30 })
  timeoutMinutos: number;

  @Column({ name: 'perfi_ctr_mfare', default: false })
  requiereMFA: boolean;

  // Status
  @Column({ name: 'perfi_ctr_activ', default: true })
  activo: boolean;

  @Column({ name: 'perfi_ctr_defec', default: false })
  esDefecto: boolean;

  @Column({ name: 'perfi_fec_creac', type: 'timestamp', default: () => 'NOW()' })
  fechaCreacion: Date;

  @Column({ name: 'perfi_fec_modif', type: 'timestamp', default: () => 'NOW()' })
  fechaModificacion: Date;
}

