import { IsString, IsUUID } from "class-validator";

export class TransferOwnershipDto {
  @IsString()
  @IsUUID()
  newOwnerUserId!: string;
}
