const { PrismaClient } = require('@prisma/client');

// Configuración del cliente Prisma
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
  errorFormat: 'colorless',
});

// Middleware para logging de consultas lentas
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  
  if (after - before > 2000) {
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
  }
  
  return result;
});

// Función para cerrar la conexión de manera elegante
const disconnectDatabase = async () => {
  await prisma.$disconnect();
};

// Manejar señales de cierre del proceso
process.on('SIGINT', disconnectDatabase);
process.on('SIGTERM', disconnectDatabase);

module.exports = { prisma, disconnectDatabase }; 