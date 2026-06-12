import { Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

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
}
