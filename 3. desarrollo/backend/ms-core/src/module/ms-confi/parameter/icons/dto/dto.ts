import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField } from "src/shared/util";

export class IconsDto {

    @Type(() => Number)
    @IsPositiveField({ message: 'El color' })
    @MinField({ message: 'El color del icono', minValue: 0 })
    icons_cod_color: number;

    @Type(() => String)
    @IsStringField({ message: 'Descripción' })
    icons_des_icons: string;

    @Type(() => String)
    @IsStringField({ message: 'fa-solid fa-home / home' })
    icons_cod_html: string;


}