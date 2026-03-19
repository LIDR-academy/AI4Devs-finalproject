import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';

@Module({
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
