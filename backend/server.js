const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const responseFormatter = require('./src/adapters/in/responseFormatter'); // Importa el middleware
const errorHandler = require('./src/adapters/in/errorHandler'); // Middleware global
const fs = require('fs');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Swagger setup (documentación básica)
const swaggerFile = path.join(__dirname, 'docs', 'swagger.json');
let swaggerDocument = {};
if (fs.existsSync(swaggerFile)) {
  swaggerDocument = require(swaggerFile);
} else {
  // Estructura mínima para Swagger
  swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'Buscadoc API',
      version: '1.0.0',
      description: 'API para búsqueda de especialistas médicos por especialidad y ubicación',
    },
    paths: {},
    components: {},
  };
  fs.writeFileSync(swaggerFile, JSON.stringify(swaggerDocument, null, 2));
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const authMiddleware = require('./src/adapters/in/authMiddleware'); // Importa el middleware
app.use(authMiddleware); // Aplica el middleware global de autenticación

app.use(responseFormatter); // Aplica el middleware de estandarización de respuestas
// Rutas principales (se agregará /api/doctors en el siguiente paso)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/auth', require('./src/adapters/in/authRoutes'));
app.use('/api/doctors', require('./src/adapters/in/doctorRoutes'));

// Manejo global de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Buscadoc backend running on port ${PORT}`);
});

module.exports = app; // Para pruebas con Jest/Supertest