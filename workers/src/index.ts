import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { logger } from './utils/logger';
import { initializeQueues } from './queues';
import { initializeSchedulers } from './schedulers';

// Cargar variables de entorno
dotenv.config();

async function startWorker() {
  try {
    // Conectar a base de datos
    await AppDataSource.initialize();
    logger.info('✅ Base de datos conectada');

    // Inicializar colas de trabajos
    await initializeQueues();
    logger.info('✅ Colas de trabajos inicializadas');

    // Inicializar schedulers (cron jobs)
    initializeSchedulers();
    logger.info('✅ Schedulers inicializados');

    logger.info('🚀 Worker iniciado correctamente');
  } catch (error) {
    logger.error('❌ Error al iniciar worker:', error);
    process.exit(1);
  }
}

startWorker();

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido, cerrando worker...');
  await AppDataSource.destroy();
  process.exit(0);
});
