import { ArrayNotEmpty, IsArray, IsUUID } from "class-validator";

export class BulkDismissExpiredDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("all", { each: true })
  itemIds!: string[];
}
