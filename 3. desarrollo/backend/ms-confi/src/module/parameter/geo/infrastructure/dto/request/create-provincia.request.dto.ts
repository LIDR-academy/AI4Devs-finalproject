import { ProvinciaEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, MaxLengthField, IsRequiredField } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';
import { GeoEnum } from "../../enum/enum";
import { IsBoolean, IsOptional } from "class-validator";

export class CreateProvinciaRequestDto implements Omit<ProvinciaEntity, 'provi_cod_provi' | 'provi_fec_creac' | 'provi_fec_modif' | 'provi_fec_elimi'> {
  @Type(() => String)
  @IsRequiredField({ message: 'El código de provincia' })
  @IsStringField({ message: 'El código de provincia' })
  @ApiProperty({ 
    example: '01', 
    description: 'Código SEPS/INEC de la provincia (2 caracteres, preserva ceros a la izquierda)',
    minLength: 1,
    maxLength: 2
  })
  @MaxLengthField({ message: 'El código de provincia', maxLength: 2 })
  provi_cod_prov: string;

  @Type(() => String)
  @IsRequiredField({ message: 'El nombre de la provincia' })
  @IsStringField({ message: 'El nombre de la provincia' })
  @ApiProperty({ 
    example: 'Azuay', 
    description: `Nombre de la ${GeoEnum.title.provi}`,
    maxLength: 100
  })
  @MaxLengthField({ message: `El nombre de la ${GeoEnum.title.provi}`, maxLength: 100 })
  provi_nom_provi: string;

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean({ message: 'El flag de activo debe ser un valor booleano' })
  @ApiProperty({ 
    example: true, 
    description: 'Indica si la provincia está activa',
    default: true,
    required: false
  })
  provi_flg_acti: boolean;
}

