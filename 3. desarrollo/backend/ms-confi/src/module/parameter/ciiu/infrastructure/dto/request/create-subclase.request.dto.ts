import { SubclaseEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, MaxLengthField, IsRequiredField } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';
import { CiiuEnum } from "../../enum/enum";
import { IsInt, Min } from "class-validator";

export class CreateSubclaseRequestDto implements Omit<SubclaseEntity, 'cisub_cod_cisub' | 'cisub_fec_creac' | 'cisub_fec_elimi'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El código de clase' })
  @IsInt({ message: 'El código de clase debe ser un número entero' })
  @Min(1, { message: 'El código de clase debe ser mayor a 0' })
  @ApiProperty({ example: 1, description: 'ID de la clase CIIU (Nivel 4)', type: Number })
  cisub_cod_cicla: number;

  @Type(() => String)
  @IsRequiredField({ message: 'El código de subclase' })
  @IsStringField({ message: 'El código de subclase' })
  @ApiProperty({ example: 'A01111', description: 'Código CIIU de la subclase (6 caracteres)', maxLength: 6 })
  @MaxLengthField({ message: 'El código de subclase', maxLength: 6 })
  cisub_abr_cisub: string;

  @Type(() => String)
  @IsRequiredField({ message: 'La descripción de la subclase' })
  @IsStringField({ message: 'La descripción de la subclase' })
  @ApiProperty({ example: 'Cultivo de maíz', description: `Descripción de la ${CiiuEnum.title.cisub}`, maxLength: 200 })
  @MaxLengthField({ message: `La descripción de la ${CiiuEnum.title.cisub}`, maxLength: 200 })
  cisub_des_cisub: string;
}

