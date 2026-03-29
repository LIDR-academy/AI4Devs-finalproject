import { env } from '@/config/env';
import prisma from '@/infrastructure/database/prisma';
import { setupWorker } from '@/infrastructure/queue/bullmq.worker';

const startWorker = async () => {
  console.log('👷 Worker service starting...');

  try {
    // Basic connection test
    await prisma.$connect();
    console.log('✅ Database connected');

    // Start BullMQ Worker
    setupWorker();

    console.log(`✅ Worker service running in ${env.NODE_ENV} mode`);
  } catch (error) {
    console.error('❌ Failed to start worker:', error);
    process.exit(1);
  }
};

startWorker();
