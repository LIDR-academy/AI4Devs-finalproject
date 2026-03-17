/**
 * Punto de entrada principal para la aplicación TaskDistributor
 */
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 4000;

// Iniciar el servidor
const server = app.listen(PORT, () => {
  console.log(`
🚀 TaskDistributor API iniciado correctamente
📍 Puerto: ${PORT}
🌍 Entorno: ${process.env.NODE_ENV || 'development'}
📅 Fecha: ${new Date().toLocaleString('es-ES')}

📋 Endpoints disponibles:
   • Health Check: http://localhost:${PORT}/health
   • API Docs: http://localhost:${PORT}/api/docs
   • Auth: http://localhost:${PORT}/api/auth/*
   • Tasks: http://localhost:${PORT}/api/tasks/*

🔧 Base de datos configurada ✅
   • Migraciones ejecutadas
   • Datos de prueba cargados
   • Usuarios disponibles:
     - admin@taskdistributor.com / password123
     - negocio@taskdistributor.com / password123
     - tecnologia@taskdistributor.com / password123
  `);
});

// Manejo de errores del servidor
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requiere privilegios elevados`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} ya está en uso`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Manejo elegante del cierre del servidor
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

module.exports = server; 