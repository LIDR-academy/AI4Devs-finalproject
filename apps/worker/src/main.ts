import { Worker } from 'bullmq';
import { conversationProcessor } from './processors/conversation.processor';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
const connection = parseRedisUrl(redisUrl);

const worker = new Worker(
  'process-conversation',
  conversationProcessor,
  { connection, concurrency: 2 },
);

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});

console.log('[Worker] Listening for process-conversation jobs...');

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
