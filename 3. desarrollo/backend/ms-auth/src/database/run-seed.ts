import { AppDataSource } from '../common/database/data-source';
import { SeedAdminUser1734892900000 } from './seeds/1734892900000-SeedAdminUser';

/**
 * Script para ejecutar el seed del usuario administrador
 */
async function runSeed() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await AppDataSource.initialize();

    console.log('✅ Conexión exitosa');
    console.log('🌱 Ejecutando seed de usuario administrador...\n');

    const seed = new SeedAdminUser1734892900000();
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await seed.up(queryRunner);
      await queryRunner.commitTransaction();
      console.log('\n✅ Seed ejecutado exitosamente');
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    await AppDataSource.destroy();
    console.log('✅ Conexión cerrada');
  } catch (error: any) {
    console.error('❌ Error al ejecutar seed:');
    console.error(`   ${error.message}`);
    if (error.code) {
      console.error(`   Código: ${error.code}`);
    }
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runSeed();
}

export { runSeed };

