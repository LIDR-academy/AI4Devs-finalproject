import { Type } from "class-transformer";
import {
  IsIn,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export const PANTRY_UNITS = ["unit", "g", "kg", "ml", "l", "pack"] as const;
export const STORAGE_LOCATIONS = ["Pantry", "Fridge", "Freezer"] as const;

export class CreatePantryItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsIn(PANTRY_UNITS)
  unit!: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  @IsIn(STORAGE_LOCATIONS)
  storageLocation?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pricePaid?: number;
}
