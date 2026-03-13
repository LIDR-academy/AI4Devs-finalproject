import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import {
  ProcessConversationJobData,
  ProcessResponseJobData,
} from '@adresles/shared-types';

export { ProcessConversationJobData, ProcessResponseJobData } from '@adresles/shared-types';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private processConversationQueue: Queue<ProcessConversationJobData>;
  private processResponseQueue: Queue<ProcessResponseJobData>;

  constructor(private readonly config: ConfigService) {
    const redisUrl = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
    const connection = this.parseRedisUrl(redisUrl);
    const defaultJobOptions = { attempts: 3, backoff: { type: 'exponential' as const, delay: 1000 } };

    this.processConversationQueue = new Queue<ProcessConversationJobData>(
      'process-conversation',
      { connection, defaultJobOptions },
    );
    this.processResponseQueue = new Queue<ProcessResponseJobData>(
      'process-response',
      { connection, defaultJobOptions },
    );
  }

  async addProcessConversationJob(data: ProcessConversationJobData): Promise<string> {
    const job = await this.processConversationQueue.add('process', data);
    return job.id ?? '';
  }

  async addProcessResponseJob(data: ProcessResponseJobData): Promise<string> {
    const job = await this.processResponseQueue.add('process', data);
    return job.id ?? '';
  }

  async onModuleDestroy() {
    await this.processConversationQueue.close();
    await this.processResponseQueue.close();
  }

  private parseRedisUrl(url: string): { host: string; port: number; password?: string } {
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
}
