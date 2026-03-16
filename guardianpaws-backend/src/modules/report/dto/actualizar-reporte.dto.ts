import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { EstadoReporte } from '../entities/historial-reporte.entity';

export class ActualizarReporteDto {
    @IsString()
    @IsOptional()
    ubicacion?: string;

    @IsEnum(EstadoReporte)
    @IsOptional()
    estado?: EstadoReporte;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsBoolean()
    @IsOptional()
    encontrada?: boolean;
} 