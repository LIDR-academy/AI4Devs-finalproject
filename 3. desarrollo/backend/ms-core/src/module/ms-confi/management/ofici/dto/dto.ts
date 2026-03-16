import { Type } from "class-transformer";
import { IsNumberField, IsStringField } from "src/shared/util";
import { OficiEnum } from "../enum/enum";

export class OficiDto {

    // Atributos
    @Type(() => String)
    @IsStringField({ message: `Nombre de la ${OficiEnum.title}` })
    ofici_nom_ofici: string;

    @Type(() => String)
    @IsStringField({ message: `Dirección de la ${OficiEnum.title}` })
    ofici_dir_ofici: string;

    // Relaciones
    @Type(() => Number)
    @IsNumberField({ message: `Código de la Empresa` })
    ofici_cod_empre: number;

    @Type(() => Number)
    @IsNumberField({ message: `Código del Tipo del oficina` })
    ofici_cod_tofic: number;
}