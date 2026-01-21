import { ClrfiEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, IsRequiredField, LengthField, IsNumberField, IsBooleanField } from "src/shared/util";
import { IsOptional } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { ClrfiEnum } from "../../enum/enum";

export class CreateClrfiRequestDto implements Omit<ClrfiEntity, 'clrfi_cod_clrfi' | 'created_at' | 'updated_at' | 'deleted_at'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El cliente' })
  @IsNumberField({ message: 'El cliente' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del cliente (rrfclien)'
  })
  clrfi_cod_clien: number;

  @Type(() => Boolean)
  @IsRequiredField({ message: 'Si tiene residencia fiscal extranjera' })
  @IsBooleanField({ message: 'Si tiene residencia fiscal extranjera' })
  @ApiProperty({ 
    example: false, 
    description: 'Tiene residencia fiscal extranjera (CRS/FATCA)'
  })
  clrfi_ctr_resfi: boolean;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'El país' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del país de residencia fiscal (rrfnacio)',
    required: false,
    nullable: true
  })
  clrfi_cod_nacio?: number;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'La dirección' })
  @LengthField({ message: 'La dirección' }, 1, 200)
  @ApiProperty({ 
    example: 'AV. PRINCIPAL 123', 
    description: 'Dirección',
    required: false,
    nullable: true,
    maxLength: 200
  })
  clrfi_dir_resfi?: string;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'La provincia' })
  @LengthField({ message: 'La provincia' }, 1, 50)
  @ApiProperty({ 
    example: 'CALIFORNIA', 
    description: 'Provincia (texto libre)',
    required: false,
    nullable: true,
    maxLength: 50
  })
  clrfi_des_provi?: string;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'La ciudad' })
  @LengthField({ message: 'La ciudad' }, 1, 50)
  @ApiProperty({ 
    example: 'LOS ANGELES', 
    description: 'Ciudad (texto libre)',
    required: false,
    nullable: true,
    maxLength: 50
  })
  clrfi_des_ciuda?: string;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El código postal' })
  @LengthField({ message: 'El código postal' }, 1, 10)
  @ApiProperty({ 
    example: '90001', 
    description: 'Código postal',
    required: false,
    nullable: true,
    maxLength: 10
  })
  clrfi_cod_posta?: string;

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

