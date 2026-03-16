import { Request, Response } from 'express';
import embeddingService from '../services/embedding.service';
import logger from '../utils/logger';

class EmbeddingController {
  /**
   * Generate embeddings for a specific FAQ
   */
  async generateEmbeddingForFAQ(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await embeddingService.generateEmbeddingsForFAQ(id);
      
      return res.status(200).json({
        success: true,
        message: 'Embeddings generated successfully',
      });
    } catch (error) {
      logger.error('Error generating embeddings for FAQ:', error);
      
      if (error instanceof Error && error.message === 'FAQ not found') {
        return res.status(404).json({ error: 'FAQ not found' });
      }
      
      return res.status(500).json({ error: 'Failed to generate embeddings' });
    }
  }
  
  /**
   * Generate embeddings for all FAQs
   */
  async generateEmbeddingsForAllFAQs(req: Request, res: Response) {
    try {
      await embeddingService.generateEmbeddingsForAllFAQs();
      
      return res.status(200).json({
        success: true,
        message: 'Embeddings generated for all FAQs',
      });
    } catch (error) {
      logger.error('Error generating embeddings for all FAQs:', error);
      return res.status(500).json({ error: 'Failed to generate embeddings for all FAQs' });
    }
  }
  
  /**
   * Search FAQs using semantic similarity
   */
  async searchFAQs(req: Request, res: Response) {
    try {
      const { query, limit } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      // Parse limit parameter, default to 5
      const searchLimit = limit ? parseInt(limit as string, 10) : 5;
      
      const results = await embeddingService.searchFAQs(query, searchLimit);
      
      return res.status(200).json(results);
    } catch (error) {
      logger.error('Error searching FAQs with embeddings:', error);
      return res.status(500).json({ error: 'Failed to search FAQs' });
    }
  }

  /**
   * Debug endpoint to check FAQ chunks and embeddings
   */
  async debugFAQChunks(req: Request, res: Response) {
    try {
      const { faqId } = req.params;
      
      if (faqId) {
        // Get chunks for specific FAQ
        const chunks = await embeddingService.getFAQChunks(faqId);
        return res.status(200).json({
          faqId,
          chunks: chunks.map(chunk => ({
            id: chunk.id,
            content: chunk.content,
            hasEmbedding: !!chunk.embedding,
            embeddingLength: chunk.embedding ? JSON.parse(chunk.embedding).length : 0
          }))
        });
      } else {
        // Get all chunks
        const allChunks = await embeddingService.getAllFAQChunks();
        return res.status(200).json({
          total: allChunks.length,
          chunks: allChunks.map(chunk => ({
            id: chunk.id,
            faqId: chunk.faqId,
            content: chunk.content.substring(0, 100) + '...',
            hasEmbedding: !!chunk.embedding,
            embeddingLength: chunk.embedding ? JSON.parse(chunk.embedding).length : 0,
            faqQuestion: chunk.faq?.question || 'Unknown'
          }))
        });
      }
    } catch (error) {
      logger.error('Error debugging FAQ chunks:', error);
      return res.status(500).json({ error: 'Failed to debug FAQ chunks' });
    }
  }

  /**
   * Debug endpoint to test similarity calculation
   */
  async debugSimilarity(req: Request, res: Response) {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const results = await embeddingService.debugSearchFAQs(query);
      
      return res.status(200).json(results);
    } catch (error) {
      logger.error('Error debugging similarity:', error);
      return res.status(500).json({ error: 'Failed to debug similarity' });
    }
  }

  /**
   * Clear all FAQ chunks and regenerate embeddings
   */
  async clearAndRegenerateEmbeddings(req: Request, res: Response) {
    try {
      await embeddingService.clearAllFAQChunks();
      await embeddingService.generateEmbeddingsForAllFAQs();
      
      return res.status(200).json({
        success: true,
        message: 'All FAQ chunks cleared and embeddings regenerated',
      });
    } catch (error) {
      logger.error('Error clearing and regenerating embeddings:', error);
      return res.status(500).json({ error: 'Failed to clear and regenerate embeddings' });
    }
  }

  // ===== SERVICE CHUNK METHODS =====

  /**
   * Generate embeddings for all services
   */
  async generateEmbeddingsForAllServices(req: Request, res: Response) {
    try {
      await embeddingService.generateEmbeddingsForAllServiceChunks();
      
      return res.status(200).json({
        success: true,
        message: 'Embeddings generated for all services',
      });
    } catch (error) {
      logger.error('Error generating embeddings for all services:', error);
      return res.status(500).json({ error: 'Failed to generate embeddings for all services' });
    }
  }

  /**
   * Search services using embeddings
   */
  async searchServices(req: Request, res: Response) {
    try {
      const { query, limit = 5 } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      
      const services = await embeddingService.searchServiceChunks(query, parseInt(limit as string));
      
      return res.status(200).json({
        success: true,
        services,
        total: services.length,
      });
    } catch (error) {
      logger.error('Error searching services:', error);
      return res.status(500).json({ error: 'Failed to search services' });
    }
  }

  /**
   * Debug endpoint to check service chunks and embeddings
   */
  async debugServiceChunks(req: Request, res: Response) {
    try {
      const { serviceId } = req.params;
      
      if (serviceId) {
        // Get chunks for specific service
        const chunks = await embeddingService.getServiceChunks(serviceId);
        return res.status(200).json({
          serviceId,
          chunks: chunks.map(chunk => ({
            id: chunk.id,
            content: chunk.content,
            hasEmbedding: !!chunk.embedding,
            embeddingLength: chunk.embedding ? JSON.parse(chunk.embedding).length : 0
          }))
        });
      } else {
        // Get all chunks
        const allChunks = await embeddingService.getAllServiceChunks();
        return res.status(200).json({
          total: allChunks.length,
          chunks: allChunks.map(chunk => ({
            id: chunk.id,
            serviceId: chunk.serviceId,
            content: chunk.content.substring(0, 100) + '...',
            hasEmbedding: !!chunk.embedding,
            embeddingLength: chunk.embedding ? JSON.parse(chunk.embedding).length : 0,
            serviceName: chunk.service?.name || 'Unknown'
          }))
        });
      }
    } catch (error) {
      logger.error('Error debugging service chunks:', error);
      return res.status(500).json({ error: 'Failed to debug service chunks' });
    }
  }

  /**
   * Debug search services with detailed similarity scores
   */
  async debugSearchServices(req: Request, res: Response) {
    try {
      const { query, limit = 5 } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      
      const debugResults = await embeddingService.debugSearchServiceChunks(query, parseInt(limit as string));
      
      return res.status(200).json(debugResults);
    } catch (error) {
      logger.error('Error in debug search services:', error);
      return res.status(500).json({ error: 'Failed to debug search services' });
    }
  }

  /**
   * Clear all service chunks and regenerate embeddings
   */
  async clearAndRegenerateServiceEmbeddings(req: Request, res: Response) {
    try {
      await embeddingService.clearAllServiceChunks();
      await embeddingService.generateEmbeddingsForAllServiceChunks();
      
      return res.status(200).json({
        success: true,
        message: 'All service chunks cleared and embeddings regenerated',
      });
    } catch (error) {
      logger.error('Error clearing and regenerating service embeddings:', error);
      return res.status(500).json({ error: 'Failed to clear and regenerate service embeddings' });
    }
  }

  // ===== DOCUMENT EMBEDDING METHODS =====

  /**
   * Generate embeddings for a specific document
   */
  async generateEmbeddingForDocument(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await embeddingService.generateEmbeddingsForDocument(id);
      
      return res.status(200).json({
        success: true,
        message: 'Document embeddings generated successfully',
      });
    } catch (error) {
      logger.error('Error generating embeddings for document:', error);
      
      if (error instanceof Error && error.message === 'Document not found') {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      return res.status(500).json({ error: 'Failed to generate document embeddings' });
    }
  }

  /**
   * Generate embeddings for all documents
   */
  async generateEmbeddingsForAllDocuments(req: Request, res: Response) {
    try {
      await embeddingService.generateEmbeddingsForAllDocuments();
      
      return res.status(200).json({
        success: true,
        message: 'Embeddings generated for all documents',
      });
    } catch (error) {
      logger.error('Error generating embeddings for all documents:', error);
      return res.status(500).json({ error: 'Failed to generate embeddings for all documents' });
    }
  }

  /**
   * Search documents using embeddings
   */
  async searchDocuments(req: Request, res: Response) {
    try {
      const { query, limit = 5 } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      
      const documents = await embeddingService.searchDocuments(query, parseInt(limit as string));
      
      return res.status(200).json({
        success: true,
        documents,
        total: documents.length,
      });
    } catch (error) {
      logger.error('Error searching documents:', error);
      return res.status(500).json({ error: 'Failed to search documents' });
    }
  }
}

export default new EmbeddingController(); 