import { Injectable, NotFoundException } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

const TABLE_NAME = 'adresles-messages';
const TTL_DAYS = 90;

export interface DynamoMessage {
  conversationId: string;
  messageId: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
  expiresAt: number;
}

@Injectable()
export class MockConversationsService {
  private readonly dynamo: DynamoDBDocumentClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: QueueService,
  ) {
    const raw = new DynamoDBClient({
      region: process.env.AWS_REGION ?? 'eu-west-1',
      endpoint: process.env.DYNAMODB_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'local',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'local',
      },
    });
    this.dynamo = DynamoDBDocumentClient.from(raw);
  }

  async replyToConversation(conversationId: string, userMessage: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    await this.saveUserMessage(conversationId, userMessage);

    const jobId = await this.queue.addProcessResponseJob({
      conversationId,
      orderId: conversation.orderId,
      userId: conversation.userId,
      userMessage,
    });

    return {
      conversation_id: conversationId,
      order_id: conversation.orderId,
      job_id: jobId,
      status: 'queued',
    };
  }

  async getConversationHistory(conversationId: string): Promise<DynamoMessage[]> {
    const result = await this.dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'conversationId = :cid',
        ExpressionAttributeValues: { ':cid': conversationId },
        ScanIndexForward: true,
      }),
    );
    return (result.Items ?? []) as DynamoMessage[];
  }

  private async saveUserMessage(conversationId: string, content: string): Promise<void> {
    const messageId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const expiresAt = Math.floor(Date.now() / 1000) + TTL_DAYS * 24 * 60 * 60;

    const item: DynamoMessage = {
      conversationId,
      messageId,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      expiresAt,
    };

    await this.dynamo.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  }
}
