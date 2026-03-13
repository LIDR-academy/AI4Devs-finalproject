import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class MockConversationReplyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;
}
