import { Controller, Post, Get, Param, Body, Sse, HttpCode, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MockConversationsService } from './mock-conversations.service';
import { MockSseService } from './mock-sse.service';
import { MockConversationReplyDto } from './dto/mock-conversation-reply.dto';

@Controller('mock/conversations')
export class MockConversationsController {
  constructor(
    private readonly service: MockConversationsService,
    private readonly sseService: MockSseService,
  ) {}

  /**
   * Simulates the user sending a reply message in the conversation.
   * Saves to DynamoDB and enqueues a process-response job.
   */
  @Post(':conversationId/reply')
  @HttpCode(HttpStatus.ACCEPTED)
  async reply(
    @Param('conversationId') conversationId: string,
    @Body() dto: MockConversationReplyDto,
  ) {
    return this.service.replyToConversation(conversationId, dto.message);
  }

  /**
   * Returns the full conversation history from DynamoDB (for debugging/UI).
   */
  @Get(':conversationId/history')
  async history(@Param('conversationId') conversationId: string) {
    return this.service.getConversationHistory(conversationId);
  }

  @Sse(':conversationId/events')
  events(@Param('conversationId') conversationId: string): Observable<MessageEvent> {
    return this.sseService.subscribe(conversationId);
  }
}
