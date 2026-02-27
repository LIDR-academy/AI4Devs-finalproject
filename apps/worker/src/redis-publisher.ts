import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

export const redisPublisher = new Redis(redisUrl);

redisPublisher.on('error', (err) =>
  console.error('[RedisPublisher] Connection error:', err.message),
);

export async function publishConversationUpdate(
  conversationId: string,
  role: string,
  content: string,
): Promise<void> {
  const payload = JSON.stringify({ role, content, timestamp: new Date().toISOString() });
  await redisPublisher.publish(`conversation:${conversationId}:update`, payload);
}

export async function publishConversationComplete(
  conversationId: string,
  status: 'COMPLETED' | 'ESCALATED' | 'TIMEOUT',
): Promise<void> {
  await redisPublisher.publish(
    `conversation:${conversationId}:update`,
    JSON.stringify({ event: 'conversation:complete', status }),
  );
}
