import { Queue, QueueEvents, Job } from 'bullmq';
import { env } from '@/config/env';
import { SocketService } from '@/infrastructure/websocket/socket.service';
import { LayerProcessingJob } from '@trace/core';

export class JobEventListener {
  private queueEvents: QueueEvents;
  private queue: Queue;

  constructor() {
    const connection = {
      host: env.REDIS_HOST,
      port: parseInt(env.REDIS_PORT),
    };

    // Queue instance for reading job data
    this.queue = new Queue('layer-processing', { connection });

    // QueueEvents for listening to events
    this.queueEvents = new QueueEvents('layer-processing', { connection });

    this.setupListeners();
    console.log('🎧 Job Event Listener initialized');
  }

  private setupListeners() {
    this.queueEvents.on('completed', async ({ jobId, returnvalue }) => {
      if (!jobId) return;

      try {
        const job = await Job.fromId<LayerProcessingJob>(this.queue, jobId);
        if (job?.data?.userId) {
          console.log(`[JobEvent] Job ${jobId} completed for user ${job.data.userId}`);
          
          // Deserialize returnvalue if it's a string (BullMQ sometimes returns stringified JSON)
          let result = returnvalue;
          if (typeof returnvalue === 'string') {
            try {
              result = JSON.parse(returnvalue);
            } catch (e) {
              // ignore parse error
            }
          }

          SocketService.getInstance().notifyUser(job.data.userId, 'layer:processed', {
            jobId,
            result 
          });
        }
      } catch (error) {
        console.error(`[JobEvent] Error handling completed job ${jobId}:`, error);
      }
    });

    this.queueEvents.on('failed', async ({ jobId, failedReason }) => {
      if (!jobId) return;

      try {
        const job = await Job.fromId<LayerProcessingJob>(this.queue, jobId);
        if (job?.data?.userId) {
          console.error(`[JobEvent] Job ${jobId} failed for user ${job.data.userId}: ${failedReason}`);

          SocketService.getInstance().notifyUser(job.data.userId, 'layer:error', {
            jobId,
            error: failedReason
          });
        }
      } catch (error) {
        console.error(`[JobEvent] Error handling failed job ${jobId}:`, error);
      }
    });
  }
}
