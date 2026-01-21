import { ActividadEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, MaxLengthField, IsRequiredField } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';
import { CiiuEnum } from "../../enum/enum";
import { IsInt, IsOptional, Min, Max } from "class-validator";

export class CreateActividadRequestDto implements Omit<ActividadEntity, 'ciact_cod_ciact' | 'ciact_fec_creac' | 'ciact_fec_elimi'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El código de subclase' })
  @IsInt({ message: 'El código de subclase debe ser un número entero' })
  @Min(1, { message: 'El código de subclase debe ser mayor a 0' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID de la subclase CIIU (Nivel 5)',
    type: Number
  })
  ciact_cod_cisub: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'El código de semáforo debe ser un número entero' })
  @Min(0, { message: 'El código de semáforo debe ser mayor o igual a 0' })
  @Max(3, { message: 'El código de semáforo debe ser menor o igual a 3' })
  @ApiProperty({ 
    example: 0, 
    description: 'Nivel de riesgo ambiental (0=Bajo, 1=Medio, 2=Alto, 3=Excluido)',
    default: 0,
    required: false,
    type: Number
  })
  ciact_cod_semaf?: number;

  @Type(() => String)
  @IsRequiredField({ message: 'El código de actividad' })
  @IsStringField({ message: 'El código de actividad' })
  @ApiProperty({ 
    example: 'A011111', 
    description: 'Código CIIU de la actividad (7 caracteres)',
    minLength: 1,
    maxLength: 7
  })
  @MaxLengthField({ message: 'El código de actividad', maxLength: 7 })
  ciact_abr_ciact: string;

  @Type(() => String)
  @IsRequiredField({ message: 'La descripción de la actividad' })
  @IsStringField({ message: 'La descripción de la actividad' })
  @ApiProperty({ 
    example: 'Cultivo de cereales (excepto arroz), legumbres y semillas oleaginosas', 
    description: `Descripción de la ${CiiuEnum.title.ciact}`,
    maxLength: 500
  })
  @MaxLengthField({ message: `La descripción de la ${CiiuEnum.title.ciact}`, maxLength: 500 })
  ciact_des_ciact: string;
}

