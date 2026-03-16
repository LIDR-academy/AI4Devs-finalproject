import { GrupoEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, MaxLengthField, IsRequiredField } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';
import { CiiuEnum } from "../../enum/enum";
import { IsInt, Min } from "class-validator";

export class CreateGrupoRequestDto implements Omit<GrupoEntity, 'cigru_cod_cigru' | 'cigru_fec_creac' | 'cigru_fec_elimi'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El código de división' })
  @IsInt({ message: 'El código de división debe ser un número entero' })
  @Min(1, { message: 'El código de división debe ser mayor a 0' })
  @ApiProperty({ example: 1, description: 'ID de la división CIIU (Nivel 2)', type: Number })
  cigru_cod_cidiv: number;

  @Type(() => String)
  @IsRequiredField({ message: 'El código de grupo' })
  @IsStringField({ message: 'El código de grupo' })
  @ApiProperty({ example: 'A011', description: 'Código CIIU del grupo (4 caracteres)', maxLength: 4 })
  @MaxLengthField({ message: 'El código de grupo', maxLength: 4 })
  cigru_abr_cigru: string;

  @Type(() => String)
  @IsRequiredField({ message: 'La descripción del grupo' })
  @IsStringField({ message: 'La descripción del grupo' })
  @ApiProperty({ example: 'Cultivo de cereales (excepto arroz), legumbres y semillas oleaginosas', description: `Descripción del ${CiiuEnum.title.cigru}`, maxLength: 200 })
  @MaxLengthField({ message: `La descripción del ${CiiuEnum.title.cigru}`, maxLength: 200 })
  cigru_des_cigru: string;
}

