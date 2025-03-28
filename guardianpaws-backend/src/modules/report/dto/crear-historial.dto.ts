import { IsEnum, IsUUID, IsString, IsOptional, IsEmail } from 'class-validator';
import { EstadoReporte } from '../enums/estado-reporte.enum';

export class CrearHistorialDto {
    @IsUUID()
    reporte_id: string;

    @IsEnum(EstadoReporte)
    estado: EstadoReporte;

    @IsString()
    @IsOptional()
    comentario?: string;

    @IsEmail()
    email: string;

    @IsString()
    telefono: string;
} 