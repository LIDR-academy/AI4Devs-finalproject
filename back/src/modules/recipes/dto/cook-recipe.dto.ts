import { ArrayNotEmpty, IsArray, IsString } from "class-validator";

export class CookRecipeDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  pantryItemIds!: string[];
}
