import { ClaseEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, MaxLengthField, IsRequiredField } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';
import { CiiuEnum } from "../../enum/enum";
import { IsInt, Min } from "class-validator";

export class CreateClaseRequestDto implements Omit<ClaseEntity, 'cicla_cod_cicla' | 'cicla_fec_creac' | 'cicla_fec_elimi'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El código de grupo' })
  @IsInt({ message: 'El código de grupo debe ser un número entero' })
  @Min(1, { message: 'El código de grupo debe ser mayor a 0' })
  @ApiProperty({ example: 1, description: 'ID del grupo CIIU (Nivel 3)', type: Number })
  cicla_cod_cigru: number;

  @Type(() => String)
  @IsRequiredField({ message: 'El código de clase' })
  @IsStringField({ message: 'El código de clase' })
  @ApiProperty({ example: 'A0111', description: 'Código CIIU de la clase (5 caracteres)', maxLength: 5 })
  @MaxLengthField({ message: 'El código de clase', maxLength: 5 })
  cicla_abr_cicla: string;

  @Type(() => String)
  @IsRequiredField({ message: 'La descripción de la clase' })
  @IsStringField({ message: 'La descripción de la clase' })
  @ApiProperty({ example: 'Cultivo de cereales (excepto arroz)', description: `Descripción de la ${CiiuEnum.title.cicla}`, maxLength: 200 })
  @MaxLengthField({ message: `La descripción de la ${CiiuEnum.title.cicla}`, maxLength: 200 })
  cicla_des_cicla: string;
}

