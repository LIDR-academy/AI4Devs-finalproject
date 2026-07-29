import { IsInt, Max, Min } from 'class-validator';

export class UpsertGoalDto {
  @IsInt()
  @Min(1)
  @Max(365)
  target_book_count: number;
}
