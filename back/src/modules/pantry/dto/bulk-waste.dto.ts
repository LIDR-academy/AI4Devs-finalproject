import { ArrayNotEmpty, IsArray, IsUUID } from "class-validator";

export class BulkWasteDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("all", { each: true })
  itemIds!: string[];
}
