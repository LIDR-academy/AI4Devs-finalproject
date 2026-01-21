import { CantonEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, MaxLengthField, IsNumberField, IsRequiredField } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';
import { GeoEnum } from "../../enum/enum";
import { IsBoolean, IsOptional } from "class-validator";

export class CreateCantonRequestDto implements Omit<CantonEntity, 'canto_cod_canto' | 'canto_fec_creac' | 'canto_fec_modif' | 'canto_fec_elimi'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El ID de la provincia' })
  @IsNumberField({ message: 'El ID de la provincia' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID de la provincia a la que pertenece el cantón'
  })
  provi_cod_provi: number;

  @Type(() => String)
  @IsRequiredField({ message: 'El código del cantón' })
  @IsStringField({ message: 'El código del cantón' })
  @ApiProperty({ 
    example: '01', 
    description: 'Código SEPS del cantón (2 caracteres, preserva ceros a la izquierda)',
    minLength: 1,
    maxLength: 2
  })
  @MaxLengthField({ message: 'El código del cantón', maxLength: 2 })
  canto_cod_cant: string;

  @Type(() => String)
  @IsRequiredField({ message: 'El nombre del cantón' })
  @IsStringField({ message: 'El nombre del cantón' })
  @ApiProperty({ 
    example: 'Cuenca', 
    description: `Nombre del ${GeoEnum.title.canto}`,
    maxLength: 100
  })
  @MaxLengthField({ message: `El nombre del ${GeoEnum.title.canto}`, maxLength: 100 })
  canto_nom_canto: string;

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean({ message: 'El flag de activo debe ser un valor booleano' })
  @ApiProperty({ 
    example: true, 
    description: 'Indica si el cantón está activo',
    default: true,
    required: false
  })
  canto_flg_acti: boolean;
}

