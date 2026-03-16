import { ClecoEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, IsRequiredField, LengthField, IsNumberField } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';
import { ClecoEnum } from "../../enum/enum";

export class CreateClecoRequestDto implements Omit<ClecoEntity, 'cleco_cod_cleco' | 'created_at' | 'updated_at' | 'deleted_at'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El cliente' })
  @IsNumberField({ message: 'El cliente' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del cliente (rrfclien)'
  })
  cleco_cod_clien: number;

  @Type(() => String)
  @IsRequiredField({ message: 'El código de actividad económica BCE' })
  @IsStringField({ message: 'El código de actividad económica BCE' })
  @LengthField({ message: 'El código de actividad económica BCE' }, 1, 10)
  @ApiProperty({ 
    example: 'A011111', 
    description: 'Código actividad económica BCE (máximo 10 caracteres)',
    maxLength: 10
  })
  cleco_cod_aebce: string;

  @Type(() => String)
  @IsRequiredField({ message: 'El código de subactividad BCE' })
  @IsStringField({ message: 'El código de subactividad BCE' })
  @LengthField({ message: 'El código de subactividad BCE' }, 1, 10)
  @ApiProperty({ 
    example: 'A0111111', 
    description: 'Código subactividad BCE (máximo 10 caracteres)',
    maxLength: 10
  })
  cleco_cod_saebc: string;

  @Type(() => String)
  @IsRequiredField({ message: 'El código de detalle financiero BCE' })
  @IsStringField({ message: 'El código de detalle financiero BCE' })
  @LengthField({ message: 'El código de detalle financiero BCE' }, 1, 10)
  @ApiProperty({ 
    example: 'A01111111', 
    description: 'Código detalle financiero BCE (máximo 10 caracteres)',
    maxLength: 10
  })
  cleco_cod_dtfin: string;

  @Type(() => String)
  @IsRequiredField({ message: 'El código de sector BCE' })
  @IsStringField({ message: 'El código de sector BCE' })
  @LengthField({ message: 'El código de sector BCE' }, 1, 10)
  @ApiProperty({ 
    example: 'A', 
    description: 'Código sector BCE (máximo 10 caracteres)',
    maxLength: 10
  })
  cleco_cod_sebce: string;

  @Type(() => String)
  @IsRequiredField({ message: 'El código de subsegmento BCE' })
  @IsStringField({ message: 'El código de subsegmento BCE' })
  @LengthField({ message: 'El código de subsegmento BCE' }, 1, 10)
  @ApiProperty({ 
    example: 'A01', 
    description: 'Código subsegmento BCE (máximo 10 caracteres)',
    maxLength: 10
  })
  cleco_cod_ssgbc: string;

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

