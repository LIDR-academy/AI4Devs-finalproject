import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { requestLoggerMiddleware } from './middleware/logger';
import { generalLimiter } from './middleware/rate-limit';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import healthRouter from './routes/health.routes';

const app = express();

app.use(corsMiddleware);
app.use(requestLoggerMiddleware);
app.use(generalLimiter);
app.use(express.json());

// Routes
app.use('/api', healthRouter);

// 404 and error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
