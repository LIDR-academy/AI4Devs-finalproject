import express from 'express';
import { getDashboardStats } from '../../application/controllers/dashboardController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// GET dashboard statistics (protected route)
router.get('/stats', authMiddleware, getDashboardStats);

export { router as dashboardRoutes };