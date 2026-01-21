import { SeccionEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, MaxLengthField, IsRequiredField } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';
import { CiiuEnum } from "../../enum/enum";

export class CreateSeccionRequestDto implements Omit<SeccionEntity, 'cisec_cod_cisec' | 'cisec_fec_creac' | 'cisec_fec_elimi'> {
  @Type(() => String)
  @IsRequiredField({ message: 'El código de sección' })
  @IsStringField({ message: 'El código de sección' })
  @ApiProperty({ 
    example: 'A', 
    description: 'Código CIIU de la sección (1 carácter: A-U)',
    minLength: 1,
    maxLength: 1
  })
  @MaxLengthField({ message: 'El código de sección', maxLength: 1 })
  cisec_abr_cisec: string;

  @Type(() => String)
  @IsRequiredField({ message: 'La descripción de la sección' })
  @IsStringField({ message: 'La descripción de la sección' })
  @ApiProperty({ 
    example: 'Agricultura, ganadería, silvicultura y pesca', 
    description: `Descripción de la ${CiiuEnum.title.cisec}`,
    maxLength: 200
  })
  @MaxLengthField({ message: `La descripción de la ${CiiuEnum.title.cisec}`, maxLength: 200 })
  cisec_des_cisec: string;
}

