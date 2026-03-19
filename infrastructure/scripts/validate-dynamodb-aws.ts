/**
 * Script de validación de conexión a DynamoDB en AWS.
 * Escribe un mensaje de prueba, lo lee y comprueba que la tabla responde.
 *
 * Uso (desde la raíz del monorepo):
 *   pnpm dynamo:validate:dev   → valida contra adresles-messages-dev (eu-west-1)
 *   pnpm dynamo:validate:prod  → valida contra adresles-messages-prod (eu-central-1)
 *
 * Requiere: .env.dev o .env.prod con AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
 *           AWS_REGION y DYNAMODB_TABLE_NAME. No definir DYNAMODB_ENDPOINT para usar AWS real.
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar el .env indicado como primer argumento (compatible con Windows)
const envFile = process.argv[2];
if (envFile) {
  dotenv.config({ path: resolve(process.cwd(), envFile) });
}

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ?? 'adresles-messages';
const TTL_DAYS = 90;

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

async function main(): Promise<void> {
  const region = process.env.AWS_REGION ?? 'eu-west-1';
  const endpoint = process.env.DYNAMODB_ENDPOINT;

  console.log('[DynamoDB Validate] Tabla:', TABLE_NAME);
  console.log('[DynamoDB Validate] Región:', region);
  console.log('[DynamoDB Validate] Endpoint:', endpoint ?? '(AWS real)');

  if (endpoint) {
    console.warn('[DynamoDB Validate] AVISO: DYNAMODB_ENDPOINT está definido. Conectando a', endpoint);
  }

  const client = createClient();
  const testConversationId = `validate-${Date.now()}`;
  const testMessageId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const item = {
    conversationId: testConversationId,
    messageId: testMessageId,
    role: 'user' as const,
    content: 'Mensaje de prueba para validación de conexión AWS',
    timestamp: new Date().toISOString(),
    expiresAt: ttlTimestamp(),
  };

  try {
    await client.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    console.log('[DynamoDB Validate] Escritura OK');

    const result = await client.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'conversationId = :cid',
        ExpressionAttributeValues: { ':cid': testConversationId },
      }),
    );

    const found = result.Items?.some(
      (i) => i.conversationId === testConversationId && i.messageId === testMessageId,
    );

    if (found) {
      console.log('[DynamoDB Validate] Lectura OK');
      console.log('[DynamoDB Validate] ✓ Conexión a AWS DynamoDB validada correctamente.');
      process.exit(0);
    }

    console.error('[DynamoDB Validate] ✗ El ítem escrito no se encontró en la lectura.');
    process.exit(1);
  } catch (err) {
    console.error('[DynamoDB Validate] Error:', err);
    process.exit(1);
  }
}

main();
