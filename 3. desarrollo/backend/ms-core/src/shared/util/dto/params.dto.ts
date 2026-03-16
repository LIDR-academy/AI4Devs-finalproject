import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";

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

    @IsOptional()
    @IsString()
    @Type(() => String)
    all: string;
}


