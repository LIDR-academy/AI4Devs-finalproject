const pino = require('pino');
const fs = require('fs');
require('dotenv').config();

const logFilePath = process.env.LOG_FILE_PATH;

// Configuración de destinos
let transport;
if (logFilePath) {
  // Si existe la ruta, loguea en archivo y consola
  transport = pino.transport({
    targets: [
      { target: 'pino/file', options: { destination: logFilePath, mkdir: true }, level: 'info' },
      { target: 'pino-pretty', options: { colorize: true }, level: 'info' }
    ]
  });
} else {
  // Solo consola
  transport = pino.transport({
    targets: [
      { target: 'pino-pretty', options: { colorize: true }, level: 'info' }
    ]
  });
}

const logger = pino(
  {
    level: 'info',
    formatters: {
      level(label) {
        return { level: label };
      }
    },
    timestamp: pino.stdTimeFunctions.isoTime
  },
  transport
);

module.exports = logger;