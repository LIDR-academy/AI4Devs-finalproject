import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class VerificationListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  status?: 'pending' | 'approved' | 'rejected';
}
