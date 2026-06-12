import express from 'express';
import { PrismaClient } from '@prisma/client';
import { corsMiddleware } from './middleware/cors';
import { requestLoggerMiddleware } from './middleware/logger';
import { generalLimiter } from './middleware/rate-limit';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import healthRouter from './routes/health.routes';
import { createProductsRouter } from './routes/products.routes';
import { ProductRepository } from './repositories/product.repository';
import { CatalogService } from './services/catalog.service';

const prisma = new PrismaClient();
const productRepository = new ProductRepository(prisma);
const catalogService = new CatalogService(productRepository);

const app = express();

app.use(corsMiddleware);
app.use(requestLoggerMiddleware);
app.use(generalLimiter);
app.use(express.json());

// Routes
app.use('/api', healthRouter);
app.use('/api/products', createProductsRouter(catalogService));

// 404 and error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
