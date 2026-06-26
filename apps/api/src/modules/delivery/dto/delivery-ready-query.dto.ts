import { IsIn, IsOptional } from 'class-validator';

export class DeliveryReadyQueryDto {
  @IsOptional()
  @IsIn(['checkedInAt', 'totalAmount'])
  sort?: 'checkedInAt' | 'totalAmount';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
