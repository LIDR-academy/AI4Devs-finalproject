import { IsString, IsUrl, IsNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class PushSubscriptionKeysDto {
  @IsString()
  @IsNotEmpty()
  p256dh!: string;

  @IsString()
  @IsNotEmpty()
  auth!: string;
}

export class CreatePushSubscriptionDto {
  @IsUrl()
  endpoint!: string;

  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  keys!: PushSubscriptionKeysDto;
}
