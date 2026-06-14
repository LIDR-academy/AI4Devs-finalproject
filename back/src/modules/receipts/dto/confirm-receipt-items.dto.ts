import { Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsDateString,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
  IsString,
  IsUUID,
} from "class-validator";

class ConfirmReceiptItemOverrideDto {
  @IsUUID("4")
  itemId!: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pricePaid?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;
}

export class ConfirmReceiptItemsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("4", { each: true })
  itemIds!: string[];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addToPantry?: boolean;

  @IsOptional()
  @IsString()
  pantryDefaultUnit?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmReceiptItemOverrideDto)
  itemOverrides?: ConfirmReceiptItemOverrideDto[];
}
