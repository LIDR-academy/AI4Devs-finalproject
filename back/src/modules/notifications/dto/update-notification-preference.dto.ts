import { IsBoolean } from "class-validator";

export class UpdateNotificationPreferenceDto {
  @IsBoolean()
  expirationEnabled!: boolean;

  @IsBoolean()
  priceDropEnabled!: boolean;

  @IsBoolean()
  foodConsumedByOthersEnabled!: boolean;
}
