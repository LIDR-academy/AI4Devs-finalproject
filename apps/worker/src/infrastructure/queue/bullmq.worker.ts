import { Worker, Job } from 'bullmq';
import { env } from '@/config/env';
import { LayerProcessor } from '@/processors/layer.processor';
import { LayerProcessingJob } from '@trace/core';

export const setupWorker = () => {
  const layerProcessor = new LayerProcessor();

  const worker = new Worker<LayerProcessingJob>('layer-processing', async (job: Job<LayerProcessingJob>) => {
    return await layerProcessor.process(job);
  }, {
    connection: {
      host: env.REDIS_HOST,
      port: parseInt(env.REDIS_PORT),
    },
    concurrency: env.CONCURRENCY,
  });

  worker.on('completed', (job) => {
    console.log(`[BullMQ] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[BullMQ] Job ${job?.id} failed with error ${err.message}`);
  });

  console.log('🚀 Worker initialized for queue: layer-processing');
  return worker;
};
