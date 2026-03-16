import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CrearMascotaDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    tipo: string;

    @IsString()
    @IsNotEmpty()
    raza: string;

    @IsNumber()
    @IsNotEmpty()
    edad: number;

    @IsString()
    @IsNotEmpty()
    color: string;

    @IsString()
    @IsOptional()
    descripcion?: string;
} 