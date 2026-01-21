
import { Type } from "class-transformer";
import { IsStringField } from "src/shared/util";
import { EmpreEnum } from "../enum/enum";

export class EmpreDto {

    @Type(() => String)
    @IsStringField({ message: `Nombre de la ${EmpreEnum.title}` })
    empre_nom_empre: string;

    @Type(() => String)
    @IsStringField({ message: `Abreviatura de la ${EmpreEnum.title}` })
    empre_abr_empre: string;

    @Type(() => String)
    @IsStringField({ message: `Código del CONSE de la ${EmpreEnum.title}` })
    empre_cod_conse: string;

    @Type(() => String)
    @IsStringField({ message: `Código del BCE de la ${EmpreEnum.title}` })
    empre_cta_bce: string;

}