import { Type } from "class-transformer";
import { IsNumber, IsPositive, Min } from "class-validator";

export class ParamsDto {

    @IsPositive()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page: number = 1;

    @IsPositive()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    pageSize: number = 10;
}