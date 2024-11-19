const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
const collectionStrategyRoutes = require('./routes/collectionStrategy.routes');
app.use('/api/collection', collectionStrategyRoutes);

const monitoringRoutes = require('./routes/monitoring.routes');
app.use('/api/collection/monitoring', monitoringRoutes);

// Ruta raíz del servidor
app.get('/', (req, res) => {
    res.json({
        message: 'Servidor de Gestión de Cobro',
        version: '1.0.0'
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
}); 