

import { OficiParams } from "../../domain/entity";
import { Type } from "class-transformer";
import { ParamsDto } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Min } from "class-validator";


export class OficiParamsDto extends ParamsDto implements OficiParams {
    @IsPositive()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @ApiProperty({ example: 1, description: `Código de la Empresa` })
    id_empre: number;

}