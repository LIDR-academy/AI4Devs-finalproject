import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ReportePerdida } from './reporte-perdida.entity';

export enum EstadoReporte {
    ABIERTO = 'abierto',
    CERRADO = 'cerrado'
}

@Entity('historial_reporte')
export class HistorialReporte {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => ReportePerdida)
    reporte: ReportePerdida;

    @Column({ name: 'reporte_id' })
    reporteId: string;

    @Column({ name: 'estado', type: 'enum', enum: EstadoReporte, default: EstadoReporte.ABIERTO })
    estado: EstadoReporte;

    @Column({ name: 'comentario' })
    comentario: string;

    @Column({ name: 'fecha_cambio', type: 'timestamp' })
    fechaCambio: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
} 