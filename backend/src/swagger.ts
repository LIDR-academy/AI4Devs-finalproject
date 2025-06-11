import swaggerJsdoc from 'swagger-jsdoc';
import swaggerSchema from './swagger-schema.json';

const options: swaggerJsdoc.Options = {
  definition: swaggerSchema,
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 