/**
 * Script de inicialización de DynamoDB Local.
 * Crea la tabla configurada en DYNAMODB_TABLE_NAME con TTL de 90 días.
 * Variables de entorno (desde .env): DYNAMODB_ENDPOINT, DYNAMODB_TABLE_NAME, AWS_REGION, etc.
 *
 * Uso: pnpm dynamo:setup (carga .env) o npx ts-node infrastructure/scripts/setup-dynamodb.ts
 */

import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ResourceInUseException,
  UpdateTimeToLiveCommand,
} from '@aws-sdk/client-dynamodb';

const endpoint = process.env.DYNAMODB_ENDPOINT ?? 'http://localhost:8000';
const region = process.env.AWS_REGION ?? 'eu-west-1';

const client = new DynamoDBClient({
  endpoint,
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'local',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'local',
  },
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ?? 'adresles-messages';
const TTL_DAYS = 90;

async function tableExists(): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    return true;
  } catch {
    return false;
  }
}

async function createTable() {
  await client.send(
    new CreateTableCommand({
      TableName: TABLE_NAME,
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: [
        { AttributeName: 'conversationId', AttributeType: 'S' },
        { AttributeName: 'messageId', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'conversationId', KeyType: 'HASH' },
        { AttributeName: 'messageId', KeyType: 'RANGE' },
      ],
    }),
  );
}

async function enableTtl() {
  await client.send(
    new UpdateTimeToLiveCommand({
      TableName: TABLE_NAME,
      TimeToLiveSpecification: {
        AttributeName: 'expiresAt',
        Enabled: true,
      },
    }),
  );
}

async function main() {
  console.log(`[DynamoDB Setup] Endpoint: ${endpoint}`);
  console.log(`[DynamoDB Setup] Tabla: ${TABLE_NAME} | TTL: ${TTL_DAYS} días`);

  if (await tableExists()) {
    console.log(`[DynamoDB Setup] La tabla "${TABLE_NAME}" ya existe. Nada que hacer.`);
    return;
  }

  try {
    await createTable();
    console.log(`[DynamoDB Setup] Tabla "${TABLE_NAME}" creada.`);

    await enableTtl();
    console.log(`[DynamoDB Setup] TTL habilitado en atributo "expiresAt" (${TTL_DAYS} días).`);

    console.log('[DynamoDB Setup] ✓ Setup completado.');
  } catch (err) {
    if (err instanceof ResourceInUseException) {
      console.log(`[DynamoDB Setup] Tabla ya existe (race condition). OK.`);
      return;
    }
    throw err;
  }
}

main().catch((err) => {
  console.error('[DynamoDB Setup] Error:', err);
  process.exit(1);
});
