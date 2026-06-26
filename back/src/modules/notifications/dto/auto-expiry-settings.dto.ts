import { IsBoolean, IsInt, IsOptional, Max, Min } from "class-validator";

export class UpdateAutoExpirySettingsDto {
  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(60)
  thresholdDays?: number;
}
