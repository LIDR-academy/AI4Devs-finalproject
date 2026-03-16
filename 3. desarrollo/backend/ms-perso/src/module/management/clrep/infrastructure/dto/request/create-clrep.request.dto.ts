import { ClrepEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, IsRequiredField, LengthField, IsNumberField } from "src/shared/util";
import { IsOptional } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { ClrepEnum } from "../../enum/enum";
import { IsDateString } from "class-validator";

export class CreateClrepRequestDto implements Omit<ClrepEntity, 'clrep_cod_clrep' | 'created_at' | 'updated_at' | 'deleted_at'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El cliente' })
  @IsNumberField({ message: 'El cliente' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del cliente (rrfclien)'
  })
  clrep_cod_clien: number;

  @Type(() => Number)
  @IsRequiredField({ message: 'La persona representante' })
  @IsNumberField({ message: 'La persona representante' })
  @ApiProperty({ 
    example: 2, 
    description: 'ID de la persona representante (rrfperson). Debe ser >= 18 años'
  })
  clrep_cod_perso: number;

  @Type(() => Number)
  @IsRequiredField({ message: 'El tipo de representante' })
  @IsNumberField({ message: 'El tipo de representante' })
  @ApiProperty({ 
    example: 1, 
    description: 'Tipo de representante (FK a rrftrep): 1=Legal, 2=Tutor, 3=Apoderado'
  })
  clrep_cod_trep: number;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nombramiento debe ser una fecha válida' })
  @ApiProperty({ 
    example: '2020-01-15', 
    description: 'Fecha de nombramiento',
    required: false,
    nullable: true,
    type: String,
    format: 'date'
  })
  clrep_fec_nombr?: Date | null;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de vencimiento debe ser una fecha válida' })
  @ApiProperty({ 
    example: '2025-01-15', 
    description: 'Fecha de vencimiento',
    required: false,
    nullable: true,
    type: String,
    format: 'date'
  })
  clrep_fec_venci?: Date | null;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'Las observaciones' })
  @LengthField({ message: 'Las observaciones' }, 1, 200)
  @ApiProperty({ 
    example: 'Representante legal designado por escritura pública', 
    description: 'Observaciones',
    required: false,
    maxLength: 200
  })
  clrep_obs_clrep?: string;

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

