import { DivisionEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, MaxLengthField, IsRequiredField } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';
import { CiiuEnum } from "../../enum/enum";
import { IsInt, Min } from "class-validator";

export class CreateDivisionRequestDto implements Omit<DivisionEntity, 'cidiv_cod_cidiv' | 'cidiv_fec_creac' | 'cidiv_fec_elimi'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El código de sección' })
  @IsInt({ message: 'El código de sección debe ser un número entero' })
  @Min(1, { message: 'El código de sección debe ser mayor a 0' })
  @ApiProperty({ example: 1, description: 'ID de la sección CIIU (Nivel 1)', type: Number })
  cidiv_cod_cisec: number;

  @Type(() => String)
  @IsRequiredField({ message: 'El código de división' })
  @IsStringField({ message: 'El código de división' })
  @ApiProperty({ example: 'A01', description: 'Código CIIU de la división (3 caracteres)', maxLength: 3 })
  @MaxLengthField({ message: 'El código de división', maxLength: 3 })
  cidiv_abr_cidiv: string;

  @Type(() => String)
  @IsRequiredField({ message: 'La descripción de la división' })
  @IsStringField({ message: 'La descripción de la división' })
  @ApiProperty({ example: 'Cultivo de productos no perennes', description: `Descripción de la ${CiiuEnum.title.cidiv}`, maxLength: 200 })
  @MaxLengthField({ message: `La descripción de la ${CiiuEnum.title.cidiv}`, maxLength: 200 })
  cidiv_des_cidiv: string;
}

