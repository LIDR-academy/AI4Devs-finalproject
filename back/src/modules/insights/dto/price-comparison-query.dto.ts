import { IsNotEmpty, IsString } from "class-validator";

export class PriceComparisonQueryDto {
  @IsString()
  @IsNotEmpty()
  normalizedName!: string;
}
