import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsObject,
  IsInt,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOperatingRoomDto {
  @ApiProperty({
    description: 'Nombre del quirófano',
    example: 'Quirófano 1',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Código único del quirófano',
    example: 'Q1',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'El código no puede exceder 50 caracteres' })
  code?: string;

  @ApiProperty({
    description: 'Descripción del quirófano',
    example: 'Quirófano principal con equipamiento completo',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Piso donde se encuentra',
    example: 'Planta 2',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'El piso no puede exceder 50 caracteres' })
  floor?: string;

  @ApiProperty({
    description: 'Edificio donde se encuentra',
    example: 'Edificio Principal',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'El edificio no puede exceder 50 caracteres' })
  building?: string;

  @ApiProperty({
    description: 'Si está activo y disponible',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Equipamiento disponible',
    example: {
      anesthesiaMachine: true,
      ventilator: true,
      monitoringSystem: true,
      surgicalLights: 4,
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  equipment?: {
    anesthesiaMachine?: boolean;
    ventilator?: boolean;
    monitoringSystem?: boolean;
    surgicalLights?: number;
    [key: string]: any;
  };

  @ApiProperty({
    description: 'Capacidad máxima de personas',
    example: 10,
    required: false,
  })
  @IsInt()
  @IsOptional()
  capacity?: number;
}
