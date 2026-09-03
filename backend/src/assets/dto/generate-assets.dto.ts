import { IsUUID } from 'class-validator';

export class GenerateAssetsDto {
  @IsUUID()
  businessId!: string;
}
