const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestión de Cobro',
      version: '1.0.0',
      description: 'API para la gestión de estrategias de cobro personalizadas',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'desarrollo@ejemplo.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      schemas: {
        Estrategia: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            clasificacion_id: { type: 'integer' },
            nombre: { type: 'string' },
            descripcion: { type: 'string' },
            activa: { type: 'boolean' }
          }
        },
        Notificacion: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            contribuyente_id: { type: 'integer' },
            plantilla_id: { type: 'integer' },
            fecha_programada: { type: 'string', format: 'date-time' },
            estado: { type: 'string', enum: ['PENDIENTE', 'ENVIADA', 'FALLIDA'] }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
