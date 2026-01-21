import { ParroquiaEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, MaxLengthField, IsNumberField, IsRequiredField } from "src/shared/util";
import { IsBoolean, IsOptional, IsIn } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { GeoEnum } from "../../enum/enum";

export class CreateParroquiaRequestDto implements Omit<ParroquiaEntity, 'parro_cod_parro' | 'parro_fec_creac' | 'parro_fec_modif' | 'parro_fec_elimi'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El ID del cantón' })
  @IsNumberField({ message: 'El ID del cantón' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del cantón al que pertenece la parroquia'
  })
  canto_cod_canto: number;

  @Type(() => String)
  @IsRequiredField({ message: 'El código de la parroquia' })
  @IsStringField({ message: 'El código de la parroquia' })
  @ApiProperty({ 
    example: '01', 
    description: 'Código SEPS de la parroquia (2 caracteres, preserva ceros a la izquierda)',
    minLength: 1,
    maxLength: 2
  })
  @MaxLengthField({ message: 'El código de la parroquia', maxLength: 2 })
  parro_cod_parr: string;

  @Type(() => String)
  @IsRequiredField({ message: 'El nombre de la parroquia' })
  @IsStringField({ message: 'El nombre de la parroquia' })
  @ApiProperty({ 
    example: 'El Sagrario', 
    description: `Nombre de la ${GeoEnum.title.parro}`,
    maxLength: 120
  })
  @MaxLengthField({ message: `El nombre de la ${GeoEnum.title.parro}`, maxLength: 120 })
  parro_nom_parro: string;

  @Type(() => String)
  @IsOptional()
  @IsIn(['R', 'U'], { message: 'El tipo de área debe ser R (Rural) o U (Urbano)' })
  @ApiProperty({ 
    example: 'U', 
    description: 'Tipo de área: R=Rural, U=Urbano',
    enum: ['R', 'U'],
    required: false
  })
  parro_tip_area?: 'R' | 'U' | null;

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean({ message: 'El flag de activo debe ser un valor booleano' })
  @ApiProperty({ 
    example: true, 
    description: 'Indica si la parroquia está activa',
    default: true,
    required: false
  })
  parro_flg_acti: boolean;
}

