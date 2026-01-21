import { AppDataSource } from '../common/database/data-source';

/**
 * Script para probar la conexión a la base de datos
 */
async function testConnection() {
  try {
    console.log('🔄 Intentando conectar a la base de datos...');
    const options = AppDataSource.options as any;
    console.log(`   Host: ${options.host}`);
    console.log(`   Port: ${options.port}`);
    console.log(`   Database: ${options.database}`);
    console.log(`   Username: ${options.username}`);

    await AppDataSource.initialize();
    console.log('✅ Conexión exitosa a la base de datos');

    // Probar una consulta simple
    const result = await AppDataSource.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Consulta de prueba exitosa');
    console.log(`   Hora del servidor: ${result[0].current_time}`);
    console.log(`   Versión PostgreSQL: ${result[0].pg_version.split(' ')[0]} ${result[0].pg_version.split(' ')[1]}`);

    // Verificar si las tablas existen
    const tables = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'rrf%'
      ORDER BY table_name;
    `);

    if (tables.length > 0) {
      console.log(`\n📊 Tablas encontradas (${tables.length}):`);
      tables.forEach((table: any) => {
        console.log(`   - ${table.table_name}`);
      });
    } else {
      console.log('\n⚠️  No se encontraron tablas. Ejecuta las migraciones primero.');
    }

    await AppDataSource.destroy();
    console.log('\n✅ Conexión cerrada correctamente');
  } catch (error: any) {
    console.error('❌ Error al conectar a la base de datos:');
    console.error(`   ${error.message}`);
    if (error.code) {
      console.error(`   Código: ${error.code}`);
    }
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testConnection();
}

export { testConnection };

