import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialReporte, EstadoReporte } from '../entities/historial-reporte.entity';
import { CrearHistorialDto } from '../dto/crear-historial.dto';

@Injectable()
export class HistorialReporteService {
    constructor(
        @InjectRepository(HistorialReporte)
        private historialRepository: Repository<HistorialReporte>
    ) {}

    async crear(crearHistorialDto: CrearHistorialDto): Promise<HistorialReporte> {
        const historial = this.historialRepository.create(crearHistorialDto);
        return await this.historialRepository.save(historial);
    }

    async obtenerPorReporte(reporteId: string): Promise<HistorialReporte[]> {
        const historial = await this.historialRepository.find({
            where: { reporteId: reporteId },
            order: { fechaCambio: 'DESC' }
        });

        if (!historial.length) {
            throw new NotFoundException(`No se encontró historial para el reporte ${reporteId}`);
        }

        return historial;
    }

    async obtenerUltimoEstado(reporteId: string): Promise<EstadoReporte> {
        const ultimoHistorial = await this.historialRepository.findOne({
            where: { reporteId: reporteId },
            order: { fechaCambio: 'DESC' }
        });

        if (!ultimoHistorial) {
            return EstadoReporte.ABIERTO; // Estado por defecto
        }

        return ultimoHistorial.estado;
    }
} 