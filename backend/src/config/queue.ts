import Queue from 'bull';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const redisUrl =
  process.env.REDIS_URL ||
  `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

type NotificationQueue = {
  add: (name: string, data: unknown) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  close: () => Promise<void>;
};

const disabledQueue: NotificationQueue = {
  add: async () => undefined,
  on: () => undefined,
  close: async () => undefined,
};

let notificationQueueInstance: NotificationQueue | null = null;

/**
 * Cola de notificaciones para emails (confirmación de cita, recordatorios, etc.)
 * Web Push queda fuera del MVP - ver documentation/MVP_SCOPE.md
 */
function createNotificationQueue(): NotificationQueue {
  const queue = new Queue('notifications', redisUrl, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
    },
  });

  queue.on('error', (err) => {
    logger.error('Error en cola de notificaciones:', err);
  });

  queue.on('waiting', (jobId) => {
    logger.debug(`Job ${jobId} en espera`);
  });

  return queue;
}

export function getNotificationQueue(): NotificationQueue {
  if (
    process.env.NODE_ENV === 'test' ||
    process.env.DISABLE_BULL_QUEUE === 'true'
  ) {
    return disabledQueue;
  }

  if (!notificationQueueInstance) {
    notificationQueueInstance = createNotificationQueue();
  }

  return notificationQueueInstance;
}

export async function closeNotificationQueue(): Promise<void> {
  if (!notificationQueueInstance) {
    return;
  }
  await notificationQueueInstance.close();
  notificationQueueInstance = null;
}

// Compatibilidad retroactiva para imports existentes
export const notificationQueue: NotificationQueue = {
  add: (name, data) => getNotificationQueue().add(name, data),
  on: (event, callback) => getNotificationQueue().on(event, callback),
  close: () => closeNotificationQueue(),
};
