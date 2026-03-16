import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ReportePerdida } from '../../report/entities/reporte-perdida.entity';

@Entity('imagenes')
export class Imagen {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    url: string;

    @Column()
    key: string;

    @ManyToOne(() => ReportePerdida, reporte => reporte.imagenes)
    @JoinColumn({ name: 'reporte_id' })
    reporte: ReportePerdida;

    @Column({ name: 'reporte_id' })
    reporteId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
} 