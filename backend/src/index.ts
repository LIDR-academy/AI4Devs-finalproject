import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import recipeRoutes from './routes/recipes';
import favoriteRoutes from './routes/favorites';
import searchRoutes from './routes/search';
import authRoutes from './routes/auth';

// Cargar variables de entorno
dotenv.config();

// Verificar variables de entorno requeridas
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Error: Faltan las siguientes variables de entorno:', missingEnvVars);
  process.exit(1);
}

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);

// Manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
}); 