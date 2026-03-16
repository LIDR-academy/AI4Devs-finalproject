import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";


export class ParamsDto {
  @IsPositive()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({ example: 1, description: 'Página' })
  page: number = 1;

  @IsPositive()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({ example: 10, description: 'Tamaño de página' })
  pageSize: number = 10;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '*', required: false, description: 'Si es "*", se listan todos los registros sin paginar' })
  all: string;
}
