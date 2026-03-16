import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { HistorialReporte } from './historial-reporte.entity';
import { Imagen } from '../../image/entities/imagen.entity';
import { Mascota } from '../../mascota/entities/mascota.entity';
import { EstadoReporte } from './historial-reporte.entity';

@Entity('reporte_perdida')
export class ReportePerdida {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Mascota)
    mascota: Mascota;

    @Column({ name: 'mascota_id' })
    mascotaId: string;

    @Column({ name: 'usuario_id' })
    usuarioId: string;

    @Column()
    ubicacion: string;

    @Column({ name: 'fecha_reporte' })
    fechaReporte: Date;

    @Column({
        type: 'enum',
        enum: EstadoReporte,
        default: EstadoReporte.ABIERTO
    })
    estado: EstadoReporte;

    @Column({ nullable: true })
    descripcion: string;

    @Column({ default: false })
    encontrada: boolean;

    @OneToMany(() => HistorialReporte, historial => historial.reporte)
    historiales: HistorialReporte[];

    @OneToMany(() => Imagen, imagen => imagen.reporte)
    imagenes: Imagen[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}