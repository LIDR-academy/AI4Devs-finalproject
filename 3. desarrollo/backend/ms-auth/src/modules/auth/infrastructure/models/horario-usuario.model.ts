import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UsuarioModel } from './usuario.model';
import { DiaSemanaModel } from './dia-semana.model';

/**
 * Modelo TypeORM para la tabla rrfjorus
 * Representa los horarios de acceso de los usuarios
 */
@Entity('rrfjorus')
export class HorarioUsuarioModel {
  @PrimaryGeneratedColumn({ name: 'jorus_cod_jorus' })
  id: number;

  @Column({ name: 'jorus_cod_usuar' })
  usuarioId: number;

  @Column({ name: 'jorus_cod_diasm' })
  diaSemanaId: number;

  @Column({ name: 'jorus_hor_inici', type: 'time' })
  horaInicio: string;

  @Column({ name: 'jorus_hor_final', type: 'time' })
  horaFin: string;

  @Column({ name: 'jorus_ctr_activ', default: true })
  activo: boolean;

  // Relations
  @ManyToOne(() => UsuarioModel)
  @JoinColumn({ name: 'jorus_cod_usuar' })
  usuario: UsuarioModel;

  @ManyToOne(() => DiaSemanaModel)
  @JoinColumn({ name: 'jorus_cod_diasm' })
  diaSemana: DiaSemanaModel;
}

