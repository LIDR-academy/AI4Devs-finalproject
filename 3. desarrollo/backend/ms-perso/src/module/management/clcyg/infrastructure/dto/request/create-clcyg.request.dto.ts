import { ClcygEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, IsRequiredField, LengthField, IsNumberField } from "src/shared/util";
import { IsOptional } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { ClcygEnum } from "../../enum/enum";

export class CreateClcygRequestDto implements Omit<ClcygEntity, 'clcyg_cod_clcyg' | 'created_at' | 'updated_at' | 'deleted_at'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El cliente' })
  @IsNumberField({ message: 'El cliente' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del cliente (rrfclien)'
  })
  clcyg_cod_clien: number;

  @Type(() => Number)
  @IsRequiredField({ message: 'La persona cónyuge' })
  @IsNumberField({ message: 'La persona cónyuge' })
  @ApiProperty({ 
    example: 2, 
    description: 'ID de la persona cónyuge (rrfperson)'
  })
  clcyg_cod_perso: number;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El nombre de la empresa' })
  @LengthField({ message: 'El nombre de la empresa' }, 1, 150)
  @ApiProperty({ 
    example: 'EMPRESA XYZ S.A.', 
    description: 'Empresa donde trabaja el cónyuge',
    required: false,
    maxLength: 150
  })
  clcyg_nom_empre?: string;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El cargo' })
  @LengthField({ message: 'El cargo' }, 1, 100)
  @ApiProperty({ 
    example: 'GERENTE GENERAL', 
    description: 'Cargo del cónyuge',
    required: false,
    maxLength: 100
  })
  clcyg_des_cargo?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'Los ingresos mensuales' })
  @ApiProperty({ 
    example: 2500.00, 
    description: 'Ingresos mensuales del cónyuge (DECIMAL(12,2))',
    required: false,
    type: Number
  })
  clcyg_val_ingre?: number;

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

