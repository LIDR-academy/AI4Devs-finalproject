import { IsUUID } from 'class-validator';

export class AddTbrEntryBodyDto {
  @IsUUID()
  book_id: string;
}
