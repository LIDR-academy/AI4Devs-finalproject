import { Queue } from 'bullmq';
import { IJobQueue, LayerProcessingJob } from '@/domain/layers/job-queue.interface';
import { env } from '@/config/env';

// Warning: In production, reuse the Redis connection
const connection = {
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
};

export class BullMQProducer implements IJobQueue {
  private queue: Queue;

  constructor(queueName: string) {
    this.queue = new Queue(queueName, { 
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    });
  }

  async add(jobName: string, data: LayerProcessingJob): Promise<void> {
    await this.queue.add(jobName, data);
  }
}
