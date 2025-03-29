import { IsEnum, IsUUID, IsString, IsOptional } from 'class-validator';
import { EstadoReporte } from '../entities/historial-reporte.entity';

export class CrearHistorialDto {
    @IsUUID()
    reporte_id: string;

    @IsEnum(EstadoReporte)
    estado: EstadoReporte;

    @IsString()
    @IsOptional()
    comentario?: string;
} 