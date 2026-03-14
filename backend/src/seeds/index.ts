import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';
import { seedSpecialties } from './seed-specialties';
import { seedDoctors } from './seed-doctors';
import { seedPatient } from './seed-patient';

async function runSeeds() {
  try {
    logger.info('🌱 Iniciando seeds...');

    // Inicializar conexión a base de datos
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('✅ Base de datos conectada');
    }

    // Ejecutar seeds
    await seedSpecialties();
    await seedDoctors();
    await seedPatient();

    logger.info('✅ Seeds completados exitosamente');
  } catch (error) {
    logger.error('❌ Error al ejecutar seeds:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('✅ Conexión a base de datos cerrada');
    }
  }
}

runSeeds();
