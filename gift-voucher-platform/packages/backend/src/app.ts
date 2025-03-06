import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { connectToDatabase } from './infrastructure/database/connection';
import { errorHandler } from './interfaces/middlewares/errorHandler';
import { userRoutes } from './interfaces/routes/userRoutes';
import { storeRoutes } from './interfaces/routes/storeRoutes';
import { productRoutes } from './interfaces/routes/productRoutes';
import { orderRoutes } from './interfaces/routes/orderRoutes';
import { voucherUsageRoutes } from './interfaces/routes/voucherUsageRoutes';
import { dashboardRoutes } from './interfaces/routes/dashboardRoutes';
// Import other routes as they are implemented
import { paymentRoutes } from './interfaces/routes/paymentRoutes';
// import { redemptionRoutes } from './interfaces/routes/redemptionRoutes';

// Load environment variables
config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectToDatabase();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/voucher-usages', voucherUsageRoutes);
app.use('/api/dashboard', dashboardRoutes);
// Use other routes as they are implemented
app.use('/api/payments', paymentRoutes);
// app.use('/api/redemptions', redemptionRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
