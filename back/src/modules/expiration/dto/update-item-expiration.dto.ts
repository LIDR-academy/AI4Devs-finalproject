import { IsDateString } from "class-validator";

export class UpdateItemExpirationDto {
  @IsDateString()
  expirationDate!: string;
}
