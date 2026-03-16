import { ClasmEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, IsRequiredField, IsNumberField, IsBooleanField } from "src/shared/util";
import { IsDateString } from "class-validator";
import { IsOptional } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { ClasmEnum } from "../../enum/enum";

export class CreateClasmRequestDto implements Omit<ClasmEntity, 'clasm_cod_clasm' | 'created_at' | 'updated_at' | 'deleted_at'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El cliente' })
  @IsNumberField({ message: 'El cliente' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del cliente (rrfclien)'
  })
  clasm_cod_clien: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'El tipo representante asamblea' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del tipo representante asamblea (rrfrasam)',
    required: false,
    nullable: true
  })
  clasm_cod_rasam?: number;

  @Type(() => Date)
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nombramiento asamblea debe ser una fecha válida' })
  @ApiProperty({ 
    example: '2025-01-15', 
    description: 'Fecha de nombramiento asamblea',
    required: false,
    nullable: true,
    type: String,
    format: 'date'
  })
  clasm_fec_rasam?: Date | null;

  @Type(() => Boolean)
  @IsRequiredField({ message: 'Si es directivo' })
  @IsBooleanField({ message: 'Si es directivo' })
  @ApiProperty({ 
    example: false, 
    description: 'Es directivo',
    default: false
  })
  clasm_ctr_direc: boolean;

  @Type(() => Date)
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nombramiento directivo debe ser una fecha válida' })
  @ApiProperty({ 
    example: '2025-01-15', 
    description: 'Fecha de nombramiento directivo (requerido si es directivo)',
    required: false,
    nullable: true,
    type: String,
    format: 'date'
  })
  clasm_fec_direc?: Date | null;

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

