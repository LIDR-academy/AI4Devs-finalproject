/**
 * Script para ejecutar el particionamiento de la tabla historial_estimaciones
 * Este script debe ejecutarse después de que Prisma haya creado las tablas iniciales.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Comenzando la configuración de particionamiento...');
  
  try {
    // Leer el archivo SQL con el script de particionamiento
    const partitionScript = fs.readFileSync(
      path.join(__dirname, 'partition_setup.sql'),
      'utf8'
    );
    
    // Ejecutar el script de particionamiento directamente en la base de datos
    await prisma.$executeRawUnsafe(partitionScript);
    
    console.log('Particionamiento completado exitosamente.');
    
    // Opcionalmente, verificar que las particiones se hayan creado
    const partitions = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE tablename LIKE 'historial_estimaciones_y%'
    `;
    
    console.log('Particiones creadas:');
    partitions.forEach(partition => {
      console.log(`- ${partition.tablename}`);
    });
    
  } catch (error) {
    console.error('Error al configurar el particionamiento:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('Proceso completado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el proceso:', error);
    process.exit(1);
  });

/**
 * Nota: Este script debe ejecutarse después de que las migraciones de Prisma
 * hayan sido aplicadas, ya que requiere que la tabla exista.
 * 
 * Uso:
 * npm run db:partition
 * 
 * Esto creará la estructura de particionamiento por años para la tabla
 * historial_estimaciones, lo que mejorará el rendimiento de las consultas
 * y facilitará el mantenimiento de datos históricos.
 */ 