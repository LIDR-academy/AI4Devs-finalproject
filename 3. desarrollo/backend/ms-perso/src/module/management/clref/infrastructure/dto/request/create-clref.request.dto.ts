import { ClrefEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, IsRequiredField, LengthField, IsNumberField } from "src/shared/util";
import { ValidateIf } from "class-validator";
import { IsOptional } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { ClrefEnum } from "../../enum/enum";
import { IsDateString } from "class-validator";

export class CreateClrefRequestDto implements Omit<ClrefEntity, 'clref_cod_clref' | 'created_at' | 'updated_at' | 'deleted_at'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El cliente' })
  @IsNumberField({ message: 'El cliente' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del cliente (rrfclien)'
  })
  clref_cod_clien: number;

  @Type(() => Number)
  @IsRequiredField({ message: 'El tipo de referencia' })
  @IsNumberField({ message: 'El tipo de referencia' })
  @ApiProperty({ 
    example: 1, 
    description: 'Tipo de referencia (FK a rrftiref): 1=Personal, 2=Comercial, 3=Financiera'
  })
  clref_cod_tiref: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'La persona' })
  @ApiProperty({ 
    example: 2, 
    description: 'ID de la persona (rrfperson) si la referencia es una persona registrada',
    required: false
  })
  clref_cod_perso?: number;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El nombre de la referencia' })
  @LengthField({ message: 'El nombre de la referencia' }, 1, 150)
  @ApiProperty({ 
    example: 'JUAN PÉREZ', 
    description: 'Nombre si no es persona registrada',
    required: false,
    maxLength: 150
  })
  clref_nom_refer?: string;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'La dirección' })
  @LengthField({ message: 'La dirección' }, 1, 200)
  @ApiProperty({ 
    example: 'AV. PRINCIPAL 123', 
    description: 'Dirección',
    required: false,
    maxLength: 200
  })
  clref_dir_refer?: string;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El teléfono' })
  @LengthField({ message: 'El teléfono' }, 1, 15)
  @ApiProperty({ 
    example: '0999999999', 
    description: 'Teléfono',
    required: false,
    maxLength: 15
  })
  clref_tlf_refer?: string;

  @ValidateIf((o) => o.clref_cod_tiref === 3)
  @Type(() => String)
  @IsRequiredField({ message: 'El número de cuenta' })
  @IsStringField({ message: 'El número de cuenta' })
  @LengthField({ message: 'El número de cuenta' }, 1, 30)
  @ApiProperty({ 
    example: '1234567890', 
    description: 'Número de cuenta (requerido si tipo es Financiera)',
    required: false,
    maxLength: 30
  })
  clref_num_ctadp?: string;

  @ValidateIf((o) => o.clref_cod_tiref === 3)
  @Type(() => Number)
  @IsRequiredField({ message: 'El saldo promedio' })
  @IsNumberField({ message: 'El saldo promedio' })
  @ApiProperty({ 
    example: 5000.00, 
    description: 'Saldo promedio (requerido si tipo es Financiera)',
    required: false,
    type: Number
  })
  clref_val_saldo?: number;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de apertura debe ser una fecha válida' })
  @ApiProperty({ 
    example: '2020-01-15', 
    description: 'Fecha apertura (si financiera)',
    required: false,
    nullable: true,
    type: String,
    format: 'date'
  })
  clref_fec_apert?: Date | null;

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

