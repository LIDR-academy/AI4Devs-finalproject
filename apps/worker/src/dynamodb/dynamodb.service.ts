import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = 'adresles-messages';
const TTL_DAYS = 90;

export interface ConversationMessage {
  conversationId: string;
  messageId: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
  expiresAt: number;
}

function createClient(): DynamoDBDocumentClient {
  const raw = new DynamoDBClient({
    region: process.env.AWS_REGION ?? 'eu-west-1',
    endpoint: process.env.DYNAMODB_ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'local',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'local',
    },
  });
  return DynamoDBDocumentClient.from(raw);
}

function ttlTimestamp(): number {
  const now = new Date();
  now.setDate(now.getDate() + TTL_DAYS);
  return Math.floor(now.getTime() / 1000);
}

export async function saveMessage(
  conversationId: string,
  role: ConversationMessage['role'],
  content: string,
): Promise<void> {
  const client = createClient();
  const messageId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const item: ConversationMessage = {
    conversationId,
    messageId,
    role,
    content,
    timestamp: new Date().toISOString(),
    expiresAt: ttlTimestamp(),
  };

  await client.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
}

export async function getMessages(
  conversationId: string,
): Promise<ConversationMessage[]> {
  const client = createClient();

  const result = await client.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'conversationId = :cid',
      ExpressionAttributeValues: { ':cid': conversationId },
      ScanIndexForward: true,
    }),
  );

  // Filter out the special __state__ item
  return (result.Items ?? []).filter(
    (item) => item['messageId'] !== '__state__',
  ) as ConversationMessage[];
}

// ─── Conversation state (phase machine) ──────────────────────────────────────

const STATE_SK = '__state__';

export async function saveConversationState(
  conversationId: string,
  state: object,
): Promise<void> {
  const client = createClient();
  await client.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        conversationId,
        messageId: STATE_SK,
        state: JSON.stringify(state),
        expiresAt: ttlTimestamp(),
      },
    }),
  );
}

export async function getConversationState<T>(
  conversationId: string,
): Promise<T | null> {
  const client = createClient();
  const result = await client.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { conversationId, messageId: STATE_SK },
    }),
  );

  if (!result.Item) return null;

  try {
    return JSON.parse(result.Item['state'] as string) as T;
  } catch {
    return null;
  }
}
