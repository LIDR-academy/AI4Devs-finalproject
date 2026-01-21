import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Modelo TypeORM para la tabla rrfdiasm
 * Catálogo de días de la semana (1=Monday, 7=Sunday)
 */
@Entity('rrfdiasm')
export class DiaSemanaModel {
  @PrimaryColumn({ name: 'diasm_cod_diasm' })
  id: number; // 1-7

  @Column({ name: 'diasm_nom_diasm', length: 20 })
  nombre: string; // Lunes, Martes...

  @Column({ name: 'diasm_abr_diasm', length: 3 })
  abreviacion: string; // LUN, MAR...

  @Column({ name: 'diasm_num_orden' })
  numeroOrden: number; // 1=Monday, 7=Sunday
}

