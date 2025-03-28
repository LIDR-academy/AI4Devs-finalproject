import { IsString, IsUUID, IsOptional, IsDate, IsEnum, ValidateNested, IsArray, MaxLength, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoReporte } from '../enums/estado-reporte.enum';
import { CrearMascotaDto } from '../../mascota/dto/crear-mascota.dto';

export class CrearReporteDto {
    @ValidateNested()
    @Type(() => CrearMascotaDto)
    mascota: CrearMascotaDto;

    @IsUUID()
    usuarioId: string;

    @IsString()
    ubicacion: string;

    @IsDate()
    fechaReporte: Date;

    @IsEnum(EstadoReporte)
    @IsOptional()
    estado?: EstadoReporte;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsArray()
    @IsOptional()
    @MaxLength(3, { message: 'No se pueden subir más de 3 imágenes' })
    imagenes?: Express.Multer.File[];

    @IsEmail()
    email: string;

    @IsString()
    telefono: string;
} 