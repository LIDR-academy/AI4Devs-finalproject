const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskDistributor API',
      version: '1.0.0',
      description: 'API para el sistema de gestión y distribución de tareas TaskDistributor. Esta API permite la gestión de tareas, equipos, departamentos y la integración con Redmine para optimizar la planificación de proyectos tecnológicos.',
      contact: {
        name: 'TaskDistributor Team',
        email: 'taskdistributor@empresa.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.taskdistributor.com' 
          : 'http://localhost:4000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Servidor de Producción' 
          : 'Servidor de Desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Introduce el token JWT obtenido del endpoint de login'
        }
      },
      parameters: {
        OffsetParam: {
          name: 'offset',
          in: 'query',
          description: 'Número de registros a omitir para paginación',
          required: false,
          schema: {
            type: 'integer',
            minimum: 0,
            default: 0
          }
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Número máximo de registros a devolver',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
          }
        },
        SortParam: {
          name: 'sort',
          in: 'query',
          description: 'Campo por el que ordenar los resultados',
          required: false,
          schema: {
            type: 'string'
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acceso faltante o inválido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Token no válido'
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Error de validación en los datos enviados',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Datos de entrada inválidos'
                  },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        },
        ServerError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Error interno del servidor'
                  }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Recurso no encontrado'
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticación y gestión de usuarios'
      },
      {
        name: 'Tasks',
        description: 'Gestión de tareas y funcionalidades del sistema principal'
      },
      {
        name: 'Redmine',
        description: 'Integración con Redmine para sincronización de datos'
      },
      {
        name: 'Teams',
        description: 'Gestión de equipos y capacidades'
      },
      {
        name: 'Departments',
        description: 'Gestión de departamentos de negocio'
      }
    ]
  },
  apis: [
    './src/api/routes/*.js', // Rutas donde están las anotaciones JSDoc
    './src/api/controllers/*.js' // Controladores con documentación adicional
  ]
};

const specs = swaggerJsdoc(options);

const swaggerConfig = {
  swaggerDefinition: specs,
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info hgroup.main h2 { color: #3b82f6 }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; }
  `,
  customSiteTitle: 'TaskDistributor API Documentation',
  customfavIcon: '/favicon.ico'
};

module.exports = {
  specs,
  swaggerUi,
  swaggerConfig
}; 