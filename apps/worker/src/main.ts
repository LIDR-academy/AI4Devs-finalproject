import * as dotenv from 'dotenv';
dotenv.config({ override: true });
import { Worker } from 'bullmq';
import { conversationProcessor, processResponseProcessor } from './processors/conversation.processor';

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

console.log('[Worker] Listening for process-conversation and process-response jobs...');

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
