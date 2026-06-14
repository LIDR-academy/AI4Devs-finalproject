import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateHouseholdDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;
}
