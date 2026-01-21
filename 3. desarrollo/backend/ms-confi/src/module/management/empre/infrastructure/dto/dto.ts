import { EmpreEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';
import { EmpreEnum } from "../enum/enum";

export class EmpreDto implements EmpreEntity {

    @Type(() => String)
    @IsStringField({ message: `Nombre de la ${EmpreEnum.title}` })
    @ApiProperty({ example: 'Coperativa de Ahorro y Crédito Finantix', description: `Nombre de la ${EmpreEnum.title}` })
    empre_nom_empre: string;

    @Type(() => String)
    @IsStringField({ message: `Abreviatura de la ${EmpreEnum.title}` })
    @ApiProperty({ example: 'FINANTIX', description: `Abreviatura de la ${EmpreEnum.title}` })
    empre_abr_empre: string;

    @Type(() => String)
    @IsStringField({ message: `Código del CONSE de la ${EmpreEnum.title}` })
    @ApiProperty({ example: '0301', description: `El código del CONSE de la ${EmpreEnum.title}` })
    empre_cod_conse: string;

    @Type(() => String)
    @IsStringField({ message: `Código del BCE de la ${EmpreEnum.title}` })
    @ApiProperty({ example: '123132', description: `El código del BCE de la ${EmpreEnum.title}` })
    empre_cta_bce: string;

}