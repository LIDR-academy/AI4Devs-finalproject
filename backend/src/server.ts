import { PrismaClient } from '@prisma/client';
import app from './app';
import embeddingService from './services/embedding.service';
import logger from './utils/logger';

const prisma = new PrismaClient();

const PORT = process.env.PORT || 3001;

// Function to regenerate embeddings for all FAQs
async function regenerateEmbeddings() {
  try {
    logger.info('Regenerating embeddings for all FAQs...');
    await embeddingService.generateEmbeddingsForAllFAQs();
    logger.info('Embeddings regenerated successfully');
  } catch (error) {
    logger.error('Failed to regenerate embeddings:', error);
  }
}

const server = app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Test the server: http://localhost:${PORT}/api/health`);
  logger.info(`Process ID: ${process.pid}`);
  logger.info(`Node.js version: ${process.version}`);
  
  // Regenerate embeddings on startup
  await regenerateEmbeddings();
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Closing HTTP server and Prisma client...');
  
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
});

// Export for testing purposes
export default server; 