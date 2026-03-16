require('dotenv').config(); // Cargar variables de entorno desde el archivo .env

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const userRoutes = require('./interfaces/http/userRoutes'); // Importar las rutas de usuario
const authRoutes = require('./interfaces/http/authRoutes'); // Importar las rutas de autenticación
const reportRoutes = require('./interfaces/http/reportRoutes'); // Importar las rutas de reportes
const errorMiddleware = require('./middleware/errorMiddleware'); // Importar el middleware de errores
const ratingRoutes = require('./interfaces/http/ratingRoutes'); // Asegúrate de que la ruta sea correcta

app.use(express.json()); // Middleware para parsear JSON

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
