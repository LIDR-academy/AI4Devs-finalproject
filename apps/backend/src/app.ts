import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from '@/config/env';
import authRouter from '@/interfaces/http/routes/auth.routes';
import { projectRoutes } from '@/interfaces/http/routes/project.routes';
import { layerRoutes } from '@/interfaces/http/routes/layer.routes';
import { pinRoutes, layerPinRouter } from '@/interfaces/http/routes/pin.routes';
import { commentRoutes } from '@/interfaces/http/routes/comment.routes';

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(morgan('dev'));

// Static files (Uploads)
// Mount /uploads to the local uploads directory
import path from 'path';
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
const apiRouter = express.Router();

app.use('/api', apiRouter);

apiRouter.use('/auth', authRouter);
apiRouter.use('/projects', projectRoutes);
// La ruta de layers espera params directos, revisar si layerRoutes tiene mergeParams
apiRouter.use('/plans/:planId/layers', layerRoutes);
apiRouter.use('/layers/:layerId/pins', layerPinRouter);
apiRouter.use('/pins', pinRoutes);
apiRouter.use('/comments', commentRoutes); 


// Health Check
app.get('/health', (req, res) => {

  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default app;
