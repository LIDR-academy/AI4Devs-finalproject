import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ReportePerdida } from './reporte-perdida.entity';
import { EstadoReporte } from '../enums/estado-reporte.enum';

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

    @Column({ name: 'email' })
    email: string;

    @Column({ name: 'telefono' })
    telefono: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
} 