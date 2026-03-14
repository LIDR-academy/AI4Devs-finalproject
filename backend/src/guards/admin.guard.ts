import { authenticate, requireRole } from '../middleware/auth.middleware';

export const adminGuard = [authenticate, requireRole(['admin'])];
