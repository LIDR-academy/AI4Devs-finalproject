import { ClfinEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsRequiredField, IsNumberField } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';
import { ClfinEnum } from "../../enum/enum";

export class CreateClfinRequestDto implements Omit<ClfinEntity, 'clfin_cod_clfin' | 'created_at' | 'updated_at' | 'deleted_at'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El cliente' })
  @IsNumberField({ message: 'El cliente' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del cliente (rrfclien)'
  })
  clfin_cod_clien: number;

  @Type(() => Number)
  @IsRequiredField({ message: 'El tipo financiero' })
  @IsNumberField({ message: 'El tipo financiero' })
  @ApiProperty({ 
    example: 1, 
    description: 'Tipo de información financiera (FK a rrftifin): I=Ingreso, G=Gasto, A=Activo, P=Pasivo'
  })
  clfin_cod_tifin: number;

  @Type(() => Number)
  @IsRequiredField({ message: 'El monto' })
  @IsNumberField({ message: 'El monto' })
  @ApiProperty({ 
    example: 2500.00, 
    description: 'Monto mensual o valor (DECIMAL(15,2))',
    type: Number
  })
  clfin_val_monto: number;

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

