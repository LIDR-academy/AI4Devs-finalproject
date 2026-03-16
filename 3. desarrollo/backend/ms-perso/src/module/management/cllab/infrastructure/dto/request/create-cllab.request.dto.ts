import { CllabEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, IsRequiredField, LengthField, IsNumberField } from "src/shared/util";
import { IsOptional } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { CllabEnum } from "../../enum/enum";
import { IsDateString } from "class-validator";

export class CreateCllabRequestDto implements Omit<CllabEntity, 'cllab_cod_clab' | 'created_at' | 'updated_at' | 'deleted_at'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El cliente' })
  @IsNumberField({ message: 'El cliente' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del cliente (rrfclien)'
  })
  cllab_cod_clien: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'La dependencia' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID de la dependencia/institución (catálogo externo)',
    required: false
  })
  cllab_cod_depen?: number;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El cargo' })
  @LengthField({ message: 'El cargo' }, 1, 100)
  @ApiProperty({ 
    example: 'GERENTE GENERAL', 
    description: 'Cargo que desempeña',
    required: false,
    maxLength: 100
  })
  cllab_des_cargo?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'El tipo de contrato' })
  @ApiProperty({ 
    example: 1, 
    description: 'Tipo de contrato (FK a rrftcont)',
    required: false
  })
  cllab_cod_tcont?: number;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de ingreso debe ser una fecha válida' })
  @ApiProperty({ 
    example: '2020-01-15', 
    description: 'Fecha ingreso al trabajo',
    required: false,
    nullable: true,
    type: String,
    format: 'date'
  })
  cllab_fec_ingre?: Date | null;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin de contrato debe ser una fecha válida' })
  @ApiProperty({ 
    example: '2025-12-31', 
    description: 'Fecha fin de contrato',
    required: false,
    nullable: true,
    type: String,
    format: 'date'
  })
  cllab_fec_finct?: Date | null;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'El ingreso mensual' })
  @ApiProperty({ 
    example: 2500.00, 
    description: 'Ingreso mensual (DECIMAL(12,2))',
    required: false,
    type: Number
  })
  cllab_val_ingre?: number;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'La dirección del trabajo' })
  @LengthField({ message: 'La dirección del trabajo' }, 1, 300)
  @ApiProperty({ 
    example: 'AV. PRINCIPAL 123', 
    description: 'Dirección del trabajo',
    required: false,
    maxLength: 300
  })
  cllab_dir_traba?: string;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El teléfono del trabajo' })
  @LengthField({ message: 'El teléfono del trabajo' }, 1, 15)
  @ApiProperty({ 
    example: '0999999999', 
    description: 'Teléfono del trabajo',
    required: false,
    maxLength: 15
  })
  cllab_tlf_traba?: string;

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

