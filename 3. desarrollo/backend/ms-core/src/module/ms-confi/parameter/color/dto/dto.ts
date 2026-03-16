import { Type } from "class-transformer";
import { IsStringField } from "src/shared/util";

export class ColorDto {

    @Type(() => String)
    @IsStringField({ message: 'Descripción' })
    color_des_color: string;
    
    @Type(() => String)
    @IsStringField({ message: 'Hexadecimal' })
    color_cod_hexdc: string;
}