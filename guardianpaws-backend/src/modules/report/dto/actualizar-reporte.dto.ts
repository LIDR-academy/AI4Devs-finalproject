import { IsString, IsOptional, IsBoolean, IsEnum, IsEmail } from 'class-validator';
import { EstadoReporte } from '../enums/estado-reporte.enum';

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

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    telefono?: string;
} 