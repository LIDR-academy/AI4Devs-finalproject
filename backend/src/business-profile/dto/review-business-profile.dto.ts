import { IsUUID } from 'class-validator';

export class ReviewBusinessProfileDto {
  @IsUUID()
  businessId!: string;
}
