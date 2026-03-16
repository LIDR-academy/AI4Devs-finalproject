require('dotenv').config(); // Cargar variables de entorno desde el archivo .env

const express = require('express');
const app = express();
// Primero cargar la configuración
const config = require('../config/environment');
const PORT = process.env.PORT || 3000;
const userRoutes = require('./interfaces/http/userRoutes'); // Importar las rutas de usuario
const authRoutes = require('./interfaces/http/authRoutes'); // Importar las rutas de autenticación
const reportRoutes = require('./interfaces/http/reportRoutes'); // Importar las rutas de reportes
const errorMiddleware = require('./middleware/errorMiddleware'); // Importar el middleware de errores
const ratingRoutes = require('./interfaces/http/ratingRoutes'); // Asegúrate de que la ruta sea correcta
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');


console.log('=== ENVIRONMENT CONFIG ===');
console.log('NODE_ENV:', config.NODE_ENV);
console.log('DB_HOST:', config.DB_CONFIG.host);
console.log('DB_NAME:', config.DB_CONFIG.database);

app.use(express.json()); // Middleware para parsear JSON

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:4200', // URL de tu aplicación Angular
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Integrar las rutas de autenticación
app.use('/api/auth', authRoutes);

// Integrar las rutas de usuario
app.use('/api/users', userRoutes);

// Integrar las rutas de reportes
app.use('/api', reportRoutes);

// Integrar las rutas de calificaciones
app.use('/api', ratingRoutes);

// Middleware de manejo de errores
app.use(errorMiddleware);

app.get('/', (req, res) => {
    res.send('¡Hola, mundo!');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
