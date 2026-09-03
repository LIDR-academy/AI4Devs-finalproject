import { AssetType } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class RegenerateAssetDto {
  @IsUUID()
  businessId!: string;

  @IsEnum(AssetType)
  assetType!: AssetType;
}
