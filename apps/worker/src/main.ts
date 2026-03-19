import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

const rootEnvPath = path.resolve(process.cwd(), '../../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath, override: true });
} else {
  dotenv.config({ override: true });
}

import { Worker } from 'bullmq';
import { conversationProcessor, processResponseProcessor, setLLMService } from './processors/conversation.processor';
import { OpenAILLMService } from './llm/openai-llm.service';
import { MockLLMService } from './llm/mock-llm.service';

// ─── LLM service — instancia el servicio real o el mock según la API key ─────

const apiKey = process.env.OPENAI_API_KEY;
if (apiKey) {
  setLLMService(new OpenAILLMService(apiKey));
  console.log('[Worker] Usando OpenAI LLM service (gpt-4o-mini)');
} else {
  setLLMService(new MockLLMService());
  console.warn('[Worker] OPENAI_API_KEY no configurada — usando mock LLM service');
}

// ─── BullMQ Workers ───────────────────────────────────────────────────────────

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
const connection = parseRedisUrl(redisUrl);

const conversationWorker = new Worker(
  'process-conversation',
  conversationProcessor,
  { connection, concurrency: 2 },
);

const responseWorker = new Worker(
  'process-response',
  processResponseProcessor,
  { connection, concurrency: 2 },
);

conversationWorker.on('completed', (job) => {
  console.log(`[Worker:conversation] Job ${job.id} completed`);
});

conversationWorker.on('failed', (job, err) => {
  console.error(`[Worker:conversation] Job ${job?.id} failed:`, err.message);
});

responseWorker.on('completed', (job) => {
  console.log(`[Worker:response] Job ${job.id} completed`);
});

responseWorker.on('failed', (job, err) => {
  console.error(`[Worker:response] Job ${job?.id} failed:`, err.message);
});

console.log('[Worker] Escuchando jobs de process-conversation y process-response...');

function parseRedisUrl(url: string): { host: string; port: number; password?: string } {
  try {
    const u = new URL(url);
    const config: { host: string; port: number; password?: string } = {
      host: u.hostname,
      port: parseInt(u.port || '6379', 10),
    };
    if (u.password) config.password = u.password;
    return config;
  } catch {
    return { host: 'localhost', port: 6379 };
  }
}
