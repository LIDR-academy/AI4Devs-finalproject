import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UsuarioModel } from './usuario.model';

/**
 * Modelo TypeORM para la tabla rrfhisau
 * Representa las autorizaciones temporales de acceso fuera del horario
 */
@Entity('rrfhisau')
export class AutorizacionTemporalModel {
  @PrimaryGeneratedColumn({ name: 'hisau_cod_hisau' })
  id: number;

  @Column({ name: 'hisau_cod_usuar' })
  usuarioId: number;

  @Column({ name: 'hisau_fec_hisau', type: 'date' })
  fecha: Date;

  @Column({ name: 'hisau_hor_inici', type: 'time' })
  horaInicio: string;

  @Column({ name: 'hisau_num_minut' })
  minutosAutorizados: number;

  @Column({ name: 'hisau_cod_usaut' })
  usuarioAutorizadorId: number;

  @Column({ name: 'hisau_mot_autor', length: 255 })
  motivoAutorizacion: string;

  @Column({ name: 'hisau_ctr_habil', default: true })
  activo: boolean;

  // Relations
  @ManyToOne(() => UsuarioModel)
  @JoinColumn({ name: 'hisau_cod_usuar' })
  usuario: UsuarioModel;

  @ManyToOne(() => UsuarioModel)
  @JoinColumn({ name: 'hisau_cod_usaut' })
  usuarioAutorizador: UsuarioModel;
}

