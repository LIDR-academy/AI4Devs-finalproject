import { PersoEntity } from "../../../domain/entity/perso.entity";
import { Type } from "class-transformer";
import { IsStringField, IsRequiredField, LengthField, IsNumberField, IsEmailField } from "src/shared/util";
import { IsOptional } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from "class-validator";

export class CreatePersoRequestDto implements Omit<PersoEntity, 'perso_cod_perso' | 'created_at' | 'updated_at' | 'deleted_at' | 'perso_fec_ultrc' | 'perso_fec_ultfo' | 'perso_fec_ultfi'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El tipo de persona' })
  @IsNumberField({ message: 'El tipo de persona' })
  @Min(1, { message: 'El tipo de persona debe ser 1 (Natural) o 2 (Jurídica)' })
  @Max(2, { message: 'El tipo de persona debe ser 1 (Natural) o 2 (Jurídica)' })
  @ApiProperty({ 
    example: 1, 
    description: 'Tipo de persona: 1=Natural, 2=Jurídica',
    enum: [1, 2]
  })
  perso_cod_tpers: number;

  @Type(() => Number)
  @IsRequiredField({ message: 'El tipo de identificación' })
  @IsNumberField({ message: 'El tipo de identificación' })
  @ApiProperty({ 
    example: 1, 
    description: 'Tipo de identificación: 1=Cédula, 2=RUC, 3=Pasaporte'
  })
  perso_cod_tiden: number;

  @Type(() => String)
  @IsRequiredField({ message: 'La identificación' })
  @IsStringField({ message: 'La identificación' })
  @LengthField({ message: 'La identificación' }, 5, 20)
  @ApiProperty({ 
    example: '1234567890', 
    description: 'Cédula/RUC/Pasaporte',
    maxLength: 20
  })
  perso_ide_perso: string;

  @Type(() => String)
  @IsRequiredField({ message: 'El nombre' })
  @IsStringField({ message: 'El nombre' })
  @LengthField({ message: 'El nombre' }, 3, 250)
  @ApiProperty({ 
    example: 'PÉREZ GARCÍA JUAN CARLOS', 
    description: 'Nombre completo o Razón Social',
    maxLength: 250
  })
  perso_nom_perso: string;

  @IsRequiredField({ message: 'La fecha de nacimiento o constitución' })
  @Type(() => Date)
  @ApiProperty({ 
    example: '1990-01-15', 
    description: 'Fecha de nacimiento (Natural) o constitución (Jurídica)',
    type: String,
    format: 'date'
  })
  perso_fec_inici: Date;

  @Type(() => Number)
  @IsRequiredField({ message: 'El sexo' })
  @IsNumberField({ message: 'El sexo' })
  @ApiProperty({ 
    example: 1, 
    description: 'Sexo: 1=Masculino, 2=Femenino, 3=No aplica'
  })
  perso_cod_sexos: number;

  @Type(() => Number)
  @IsRequiredField({ message: 'La nacionalidad' })
  @IsNumberField({ message: 'La nacionalidad' })
  @ApiProperty({ 
    example: 1, 
    description: 'Código de nacionalidad'
  })
  perso_cod_nacio: number;

  @Type(() => Number)
  @IsRequiredField({ message: 'La instrucción' })
  @IsNumberField({ message: 'La instrucción' })
  @ApiProperty({ 
    example: 4, 
    description: 'Nivel de instrucción (0=N/A para jurídica)'
  })
  perso_cod_instr: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'El estado civil' })
  @ApiProperty({ 
    example: 2, 
    description: 'Estado civil (NULL para jurídica)',
    required: false,
    nullable: true
  })
  perso_cod_ecivi?: number | null;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'La etnia' })
  @ApiProperty({ 
    example: 1, 
    description: 'Etnia SEPS',
    required: false,
    nullable: true
  })
  perso_cod_etnia?: number | null;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El teléfono celular' })
  @LengthField({ message: 'El teléfono celular' }, 10, 15)
  @ApiProperty({ 
    example: '0991234567', 
    description: 'Teléfono celular',
    required: false,
    maxLength: 15
  })
  perso_tlf_celul?: string;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El teléfono convencional' })
  @LengthField({ message: 'El teléfono convencional' }, 7, 15)
  @ApiProperty({ 
    example: '022345678', 
    description: 'Teléfono convencional',
    required: false,
    maxLength: 15
  })
  perso_tlf_conve?: string;

  @Type(() => String)
  @IsOptional()
  @IsEmailField({ message: 'El correo electrónico' })
  @LengthField({ message: 'El correo electrónico' }, 5, 150)
  @ApiProperty({ 
    example: 'juan.perez@example.com', 
    description: 'Correo electrónico',
    required: false,
    maxLength: 150
  })
  perso_dir_email?: string;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El DAC del Registro Civil' })
  @LengthField({ message: 'El DAC del Registro Civil' }, 1, 50)
  @ApiProperty({ 
    example: 'ABC123', 
    description: 'DAC del Registro Civil',
    required: false,
    maxLength: 50
  })
  perso_dac_regci?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'El capital social' })
  @Min(0, { message: 'El capital social debe ser mayor o igual a 0' })
  @ApiProperty({ 
    example: 10000, 
    description: 'Capital social (solo para persona jurídica)',
    required: false
  })
  perso_cap_socia?: number;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'La ruta de la foto' })
  @ApiProperty({ 
    example: '/storage/fotos/abc123.webp', 
    description: 'Ruta de la foto',
    required: false
  })
  perso_fot_perso?: string;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'La ruta de la firma' })
  @ApiProperty({ 
    example: '/storage/firmas/xyz789.webp', 
    description: 'Ruta de la firma',
    required: false
  })
  perso_fir_perso?: string;

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

