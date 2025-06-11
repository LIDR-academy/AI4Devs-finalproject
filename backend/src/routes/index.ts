import { Router } from 'express';
import agentRoutes from './agent.routes';
import authRoutes from './auth.routes';
import chatRoutes from './chat.routes';
import documentRoutes from './document.routes'; // Re-enabled - Prisma client works at runtime
import embeddingRoutes from './embedding.routes';
import faqRoutes from './faq.routes';
import langchainChatRoutes from './langchain-chat.routes';
import productRoutes from './product.routes';
import profileRoutes from './profile.routes';
import serviceRoutes from './service.routes';
import testRoutes from './test.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Auth routes
router.use('/auth', authRoutes);

// Product routes
router.use('/products', productRoutes);

// FAQ routes
router.use('/faqs', faqRoutes);

// Agent routes
router.use('/agent', agentRoutes);

// Service routes
router.use('/services', serviceRoutes);

// Profile routes
router.use('/profile', profileRoutes);

// Document routes - Re-enabled - Prisma client works at runtime
router.use('/documents', documentRoutes);

// Embedding routes
router.use('/embeddings', embeddingRoutes);

// Chat routes (original OpenAI implementation)
router.use('/chat', chatRoutes);

// LangChain chat routes (new enhanced implementation)
router.use('/langchain', langchainChatRoutes);

// Test routes (only available in development/test environments)
router.use('/test', testRoutes);

export default router;

export {
  authRoutes,
  documentRoutes, // Re-enabled
  embeddingRoutes,
  faqRoutes,
  langchainChatRoutes,
  productRoutes,
  profileRoutes,
  serviceRoutes,
  testRoutes
};

