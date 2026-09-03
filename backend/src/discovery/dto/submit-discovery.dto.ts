import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Equals,
  Length,
  Matches,
} from 'class-validator';

export class SubmitDiscoveryDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(2, 120)
  businessName!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(2, 80)
  category!: string;

  @Transform(({ value }) => Array.isArray(value) ? value.map((item) => typeof item === 'string' ? item.trim() : item) : value)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @Length(2, 120, { each: true })
  services!: string[];

  @Transform(({ value }) => Array.isArray(value) ? value.map((item) => typeof item === 'string' ? item.trim() : item) : value)
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @Length(2, 120, { each: true })
  products?: string[];

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(10, 500)
  targetAudience!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(2, 80)
  tone!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional()
  @IsString()
  @Length(2, 160)
  style?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(2, 160)
  location!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional()
  @IsString()
  @Matches(/^[+()0-9 .-]{7,40}$/)
  phone?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  website?: string;

  @IsBoolean()
  @Equals(true)
  gdprConsent!: true;

  @IsUUID()
  businessId!: string;
}
