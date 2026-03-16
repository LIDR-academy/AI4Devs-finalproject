import { ClbenEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, IsRequiredField, LengthField, IsNumberField, IsBooleanField } from "src/shared/util";
import { IsEmail } from "class-validator";
import { IsOptional } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { ClbenEnum } from "../../enum/enum";

export class CreateClbenRequestDto implements Omit<ClbenEntity, 'clben_cod_clben' | 'created_at' | 'updated_at' | 'deleted_at'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El usuario de banca digital' })
  @IsNumberField({ message: 'El usuario de banca digital' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del usuario de banca digital (rrfclbnc)'
  })
  clben_cod_clbnc: number;

  @Type(() => String)
  @IsRequiredField({ message: 'El número de cuenta' })
  @IsStringField({ message: 'El número de cuenta' })
  @LengthField({ message: 'El número de cuenta' }, 1, 20)
  @ApiProperty({ 
    example: '1234567890', 
    description: 'Número cuenta destino',
    maxLength: 20
  })
  clben_num_cuent: string;

  @Type(() => Number)
  @IsRequiredField({ message: 'El tipo de cuenta' })
  @IsNumberField({ message: 'El tipo de cuenta' })
  @ApiProperty({ 
    example: 1, 
    description: 'Tipo cuenta: 1=Ahorros, 2=Corriente'
  })
  clben_cod_tcuen: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'La institución financiera' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID de la institución financiera (rrfifina) si es externo',
    required: false,
    nullable: true
  })
  clben_cod_ifina?: number;

  @Type(() => String)
  @IsRequiredField({ message: 'El nombre del beneficiario' })
  @IsStringField({ message: 'El nombre del beneficiario' })
  @LengthField({ message: 'El nombre del beneficiario' }, 1, 250)
  @ApiProperty({ 
    example: 'JUAN PÉREZ', 
    description: 'Nombre del beneficiario',
    maxLength: 250
  })
  clben_nom_benef: string;

  @Type(() => String)
  @IsRequiredField({ message: 'La identificación del beneficiario' })
  @IsStringField({ message: 'La identificación del beneficiario' })
  @LengthField({ message: 'La identificación del beneficiario' }, 1, 20)
  @ApiProperty({ 
    example: '1234567890', 
    description: 'Cédula/RUC del beneficiario',
    maxLength: 20
  })
  clben_ide_benef: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'El tipo de identificación' })
  @ApiProperty({ 
    example: 1, 
    description: 'Tipo identificación (FK a rrftiden)',
    required: false,
    nullable: true
  })
  clben_cod_tiden?: number;

  @Type(() => String)
  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  @LengthField({ message: 'El email' }, 1, 150)
  @ApiProperty({ 
    example: 'beneficiario@email.com', 
    description: 'Email para notificación',
    required: false,
    nullable: true,
    maxLength: 150
  })
  clben_ema_benef?: string;

  @Type(() => Boolean)
  @IsOptional()
  @IsBooleanField({ message: 'Es externo' })
  @ApiProperty({ 
    example: false, 
    description: 'Es externo (SPI)',
    required: false,
    default: false
  })
  clben_ctr_exter?: boolean;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El alias' })
  @LengthField({ message: 'El alias' }, 1, 50)
  @ApiProperty({ 
    example: 'JUAN', 
    description: 'Alias del beneficiario',
    required: false,
    nullable: true,
    maxLength: 50
  })
  clben_ali_benef?: string;

  @Type(() => Boolean)
  @IsOptional()
  @IsBooleanField({ message: 'El estado activo' })
  @ApiProperty({ 
    example: true, 
    description: 'Activo',
    required: false,
    default: true
  })
  clben_ctr_activ?: boolean;

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

