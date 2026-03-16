

import { Type } from "class-transformer";
import { ParamsDto } from "src/shared/util";
import { IsNumber, IsPositive, Min } from "class-validator";


export class OficiParamsDto extends ParamsDto {
    @IsPositive()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    id_empre: number;

}