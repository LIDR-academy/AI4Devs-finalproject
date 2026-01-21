import { ClienEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, IsRequiredField, LengthField, IsNumberField } from "src/shared/util";
import { IsOptional } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { ClienEnum } from "../../enum/enum";
import { IsBoolean, IsNumber, Min } from "class-validator";

export class CreateClienRequestDto implements Omit<ClienEntity, 'clien_cod_clien' | 'created_at' | 'updated_at' | 'deleted_at'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'La persona' })
  @IsNumberField({ message: 'La persona' })
  @Min(1, { message: 'La persona debe ser un ID válido' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID de la persona (rrfperson)'
  })
  clien_cod_perso: number;

  @Type(() => Number)
  @IsRequiredField({ message: 'La oficina' })
  @IsNumberField({ message: 'La oficina' })
  @Min(1, { message: 'La oficina debe ser un ID válido' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID de la oficina de pertenencia'
  })
  clien_cod_ofici: number;

  @Type(() => Boolean)
  @IsRequiredField({ message: 'El tipo de cliente' })
  @IsBoolean({ message: 'El tipo de cliente debe ser un valor booleano' })
  @ApiProperty({ 
    example: true, 
    description: 'true=Socio, false=Cliente',
    default: false
  })
  clien_ctr_socio: boolean;

  @IsRequiredField({ message: 'La fecha de ingreso' })
  @Type(() => Date)
  @ApiProperty({ 
    example: '2020-01-15', 
    description: 'Fecha de ingreso',
    type: String,
    format: 'date'
  })
  clien_fec_ingin: Date;

  @IsOptional()
  @Type(() => Date)
  @ApiProperty({ 
    example: null, 
    description: 'Fecha de salida/baja',
    required: false,
    nullable: true
  })
  clien_fec_salid?: Date | null;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'Las observaciones' })
  @LengthField({ message: 'Las observaciones' }, 1, 1000)
  @ApiProperty({ 
    example: 'Observaciones del cliente', 
    description: 'Observaciones',
    required: false,
    maxLength: 1000
  })
  clien_obs_clien?: string;

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

