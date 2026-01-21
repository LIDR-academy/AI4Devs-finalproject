import { CldomEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, IsRequiredField, LengthField, IsNumberField } from "src/shared/util";
import { IsOptional } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { CldomEnum } from "../../enum/enum";
import { IsNumber, Min, Max } from "class-validator";

export class CreateCldomRequestDto implements Omit<CldomEntity, 'cldom_cod_cldom' | 'created_at' | 'updated_at' | 'deleted_at'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El cliente' })
  @IsNumberField({ message: 'El cliente' })
  @Min(1, { message: 'El cliente debe ser un ID válido' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del cliente (rrfclien)'
  })
  cldom_cod_clien: number;

  @Type(() => String)
  @IsRequiredField({ message: 'La provincia' })
  @IsStringField({ message: 'La provincia' })
  @LengthField({ message: 'La provincia' }, 2, 2)
  @ApiProperty({ 
    example: '17', 
    description: 'Código provincia INEC (2 caracteres)',
    maxLength: 2,
    minLength: 2
  })
  cldom_cod_provi: string;

  @Type(() => String)
  @IsRequiredField({ message: 'El cantón' })
  @IsStringField({ message: 'El cantón' })
  @LengthField({ message: 'El cantón' }, 4, 4)
  @ApiProperty({ 
    example: '1701', 
    description: 'Código cantón INEC (4 caracteres)',
    maxLength: 4,
    minLength: 4
  })
  cldom_cod_canto: string;

  @Type(() => String)
  @IsRequiredField({ message: 'La parroquia' })
  @IsStringField({ message: 'La parroquia' })
  @LengthField({ message: 'La parroquia' }, 6, 6)
  @ApiProperty({ 
    example: '170101', 
    description: 'Código parroquia INEC (6 caracteres)',
    maxLength: 6,
    minLength: 6
  })
  cldom_cod_parro: string;

  @Type(() => String)
  @IsRequiredField({ message: 'La dirección' })
  @IsStringField({ message: 'La dirección' })
  @LengthField({ message: 'La dirección' }, 5, 300)
  @ApiProperty({ 
    example: 'AV. AMAZONAS N12-123 Y RUMIPAMBA', 
    description: 'Dirección completa',
    maxLength: 300
  })
  cldom_dir_domic: string;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El teléfono domicilio' })
  @LengthField({ message: 'El teléfono domicilio' }, 7, 15)
  @ApiProperty({ 
    example: '022345678', 
    description: 'Teléfono domicilio',
    required: false,
    maxLength: 15
  })
  cldom_tlf_domic?: string;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'La referencia de ubicación' })
  @LengthField({ message: 'La referencia de ubicación' }, 1, 200)
  @ApiProperty({ 
    example: 'FRENTE AL PARQUE CENTRAL', 
    description: 'Referencia de ubicación',
    required: false,
    maxLength: 200
  })
  cldom_sit_refdo?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'La latitud' })
  @Min(-90, { message: 'La latitud debe estar entre -90 y 90' })
  @Max(90, { message: 'La latitud debe estar entre -90 y 90' })
  @ApiProperty({ 
    example: -0.1806532, 
    description: 'Latitud GPS (DECIMAL 10,8)',
    required: false,
    type: Number
  })
  cldom_lat_coord?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'La longitud' })
  @Min(-180, { message: 'La longitud debe estar entre -180 y 180' })
  @Max(180, { message: 'La longitud debe estar entre -180 y 180' })
  @ApiProperty({ 
    example: -78.4678382, 
    description: 'Longitud GPS (DECIMAL 11,8)',
    required: false,
    type: Number
  })
  cldom_lon_coord?: number;

  @Type(() => Number)
  @IsRequiredField({ message: 'El usuario que crea' })
  @IsNumberField({ message: 'El usuario que crea' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del usuario que crea el registro'
  })
  created_by: number;

  @Type(() => Number)
  @IsRequiredField({ message: 'El usuario que actualiza' })
  @IsNumberField({ message: 'El usuario que actualiza' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del usuario que actualiza el registro'
  })
  updated_by: number;
}

