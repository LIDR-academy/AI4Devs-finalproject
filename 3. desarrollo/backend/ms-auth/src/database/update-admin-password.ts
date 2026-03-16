import { AppDataSource } from '../common/database/data-source';
import * as bcrypt from 'bcrypt';

/**
 * Script para actualizar la contraseña del usuario administrador
 * Nueva contraseña:       const nuevaPassword = 'xxxxxxxxx2025';

 */
async function updateAdminPassword() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await AppDataSource.initialize();

    console.log('✅ Conexión exitosa');
    console.log('🔐 Actualizando contraseña del usuario administrador...\n');

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Buscar el usuario administrador
      const usuario = await queryRunner.query(`
        SELECT 
          usuar_cod_usuar,
          usuar_nom_usuar,
          usuar_des_usuar
        FROM rrfusuar 
        WHERE usuar_nom_usuar = 'administrador' 
        AND usuar_fec_elimi IS NULL
        LIMIT 1;
      `);

      if (usuario.length === 0) {
        throw new Error('Usuario administrador no encontrado');
      }

      const usuarioId = usuario[0].usuar_cod_usuar;
      console.log(`   Usuario encontrado: ${usuario[0].usuar_des_usuar} (ID: ${usuarioId})`);

      // 2. Hashear la nueva contraseña
      const nuevaPassword = 'xxxxxxxxx2025';
      console.log(`   Nueva contraseña: ${nuevaPassword}`);
      console.log('   Hasheando contraseña...');
      
      const passwordHash = await bcrypt.hash(nuevaPassword, 12);
      console.log('   ✅ Contraseña hasheada');

      // 3. Actualizar la contraseña en la base de datos
      await queryRunner.query(
        `
        UPDATE rrfusuar 
        SET 
          usuar_pwd_usuar = $1,
          usuar_fec_ultpw = NOW(),
          usuar_ctr_frzpw = false,
          usuar_num_intfa = 0,
          usuar_fec_bloqu = NULL,
          usuar_fec_prifa = NULL
        WHERE usuar_cod_usuar = $2;
        `,
        [passwordHash, usuarioId]
      );

      await queryRunner.commitTransaction();
      console.log('\n✅ Contraseña actualizada exitosamente');
      console.log(`   Username: administrador`);
      console.log(`   Password: ${nuevaPassword}`);
      console.log('   ⚠️  IMPORTANTE: Cambiar la contraseña en producción');

    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    await AppDataSource.destroy();
    console.log('✅ Conexión cerrada');
  } catch (error: any) {
    console.error('❌ Error al actualizar contraseña:');
    console.error(`   ${error.message}`);
    if (error.code) {
      console.error(`   Código: ${error.code}`);
    }
    if (error.stack) {
      console.error(`   Stack: ${error.stack}`);
    }
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  updateAdminPassword();
}

export { updateAdminPassword };

