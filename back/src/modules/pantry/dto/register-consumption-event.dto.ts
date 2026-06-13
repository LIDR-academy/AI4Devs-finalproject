import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Min } from "class-validator";

export enum PantryConsumptionEventType {
  CONSUMED = "CONSUMED",
  WASTED = "WASTED",
}

export class RegisterConsumptionEventDto {
  @IsEnum(PantryConsumptionEventType)
  type!: PantryConsumptionEventType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;
}
