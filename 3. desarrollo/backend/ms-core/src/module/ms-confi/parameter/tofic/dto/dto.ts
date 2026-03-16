
import { Type } from "class-transformer";
import { IsStringField, MaxLengthField } from "src/shared/util";
import { ToficEnum } from "../enum/enum";

export class ToficDto {
    @Type(() => String)
    @IsStringField({ message: `Descripción del ${ToficEnum.title}` })
    @MaxLengthField({ message: `Descripción del ${ToficEnum.title}`, maxLength: 40 })
    tofic_des_tofic: string;

    @Type(() => String)
    @IsStringField({ message: `Abreviación del ${ToficEnum.title}` })
    @MaxLengthField({ message: `Abreviación del ${ToficEnum.title}`, maxLength: 10 })
    tofic_abr_tofic: string;
}