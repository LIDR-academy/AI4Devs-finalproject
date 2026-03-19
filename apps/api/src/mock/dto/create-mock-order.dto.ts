import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsObject,
  IsArray,
  ValidateNested,
  IsUrl,
  IsEmail,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MockStoreDto {
  @IsString()
  name!: string;

  @IsUrl()
  url!: string;
}

export class MockBuyerDto {
  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class MockAddressDto {
  @IsString()
  full_address!: string;

  @IsString()
  street!: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  block?: string;

  @IsOptional()
  @IsString()
  staircase?: string;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsString()
  door?: string;

  @IsOptional()
  @IsString()
  additional_info?: string;

  @IsString()
  postal_code!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsString()
  country!: string;
}

export class MockOrderItemDto {
  @IsString()
  name!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  price!: number;
}

export class MockGiftRecipientDto {
  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsString()
  phone!: string;
}

export type MockOrderMode = 'adresles' | 'tradicional';

export class CreateMockOrderDto {
  @ValidateNested()
  @Type(() => MockStoreDto)
  @IsObject()
  store!: MockStoreDto;

  @IsOptional()
  @IsString()
  external_order_id?: string;

  @IsOptional()
  @IsString()
  external_order_number?: string;

  @ValidateNested()
  @Type(() => MockBuyerDto)
  @IsObject()
  buyer!: MockBuyerDto;

  @IsEnum(['adresles', 'tradicional'])
  mode!: MockOrderMode;

  @IsOptional()
  @ValidateNested()
  @Type(() => MockAddressDto)
  @IsObject()
  address?: MockAddressDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MockOrderItemDto)
  items?: MockOrderItemDto[];

  @IsNumber()
  @Min(0)
  total_amount!: number;

  @IsString()
  currency!: string;

  @IsOptional()
  @IsBoolean()
  buyer_registered_ecommerce?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => MockAddressDto)
  @IsObject()
  buyer_ecommerce_address?: MockAddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MockGiftRecipientDto)
  @IsObject()
  gift_recipient?: MockGiftRecipientDto;
}
