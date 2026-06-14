import express from 'express';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { corsMiddleware } from './middleware/cors';
import { requestLoggerMiddleware } from './middleware/logger';
import { generalLimiter } from './middleware/rate-limit';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { healthRouter } from './routes/health.routes';
import { createProductsRouter } from './routes/products.routes';
import { createCartRouter } from './routes/cart.routes';
import { ProductRepository } from './repositories/product.repository';
import { CartRepository } from './repositories/cart.repository';
import { CatalogService } from './services/catalog.service';
import { CartService } from './services/cart.service';

const prisma = new PrismaClient();
const productRepository = new ProductRepository(prisma);
const cartRepository = new CartRepository(prisma);
const catalogService = new CatalogService(productRepository);
const cartService = new CartService(cartRepository, productRepository);

const app = express();

app.use(corsMiddleware);
app.use(requestLoggerMiddleware);
app.use(generalLimiter);
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api', healthRouter);
app.use('/api/products', createProductsRouter(catalogService));
app.use('/api/cart', createCartRouter(cartService));

// 404 and error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
