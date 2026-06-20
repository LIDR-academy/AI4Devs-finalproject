import { Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { PANTRY_UNITS, STORAGE_LOCATIONS } from "./create-pantry-item.dto";

export class UpdatePantryItemDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  @IsIn(PANTRY_UNITS)
  unit?: string;

  @IsOptional()
  @IsString()
  @IsIn(STORAGE_LOCATIONS)
  storageLocation?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pricePaid?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
