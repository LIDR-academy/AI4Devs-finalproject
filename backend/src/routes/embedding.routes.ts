import { Router } from 'express';
import embeddingController from '../controllers/embedding.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/embeddings/faqs/generate-all:
 *   post:
 *     summary: Generate embeddings for all FAQs
 *     tags: [Embeddings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Embeddings generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post('/faqs/generate-all', authenticate, embeddingController.generateEmbeddingsForAllFAQs);

/**
 * @swagger
 * /api/embeddings/faqs/{id}/generate:
 *   post:
 *     summary: Generate embeddings for a specific FAQ
 *     tags: [Embeddings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: FAQ ID
 *     responses:
 *       200:
 *         description: Embeddings generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Server error
 */
router.post('/faqs/:id/generate', authenticate, embeddingController.generateEmbeddingForFAQ);

/**
 * @swagger
 * /api/embeddings/faqs/search:
 *   get:
 *     summary: Search FAQs using semantic search
 *     tags: [Embeddings]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 faqs:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Server error
 */
router.get('/faqs/search', embeddingController.searchFAQs);

// Public route for regenerating embeddings (for testing)
router.post('/faqs/regenerate-all', embeddingController.generateEmbeddingsForAllFAQs);
router.post('/faqs/clear-and-regenerate', embeddingController.clearAndRegenerateEmbeddings);

// Debug routes
router.get('/faqs/debug/chunks', embeddingController.debugFAQChunks);
router.get('/faqs/debug/chunks/:faqId', embeddingController.debugFAQChunks);
router.get('/faqs/debug/similarity', embeddingController.debugSimilarity);

// ===== SERVICE CHUNK ENDPOINTS =====

/**
 * @swagger
 * /api/embeddings/services/generate-all:
 *   post:
 *     summary: Generate embeddings for all services
 *     tags: [Embeddings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Embeddings generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post('/services/generate-all', authenticate, embeddingController.generateEmbeddingsForAllServices);

/**
 * @swagger
 * /api/embeddings/services/search:
 *   get:
 *     summary: Search services using semantic search
 *     tags: [Embeddings]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Server error
 */
router.get('/services/search', embeddingController.searchServices);

/**
 * @swagger
 * /api/embeddings/services/clear-and-regenerate:
 *   post:
 *     summary: Clear all service chunks and regenerate embeddings
 *     tags: [Embeddings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service chunks cleared and embeddings regenerated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post('/services/clear-and-regenerate', authenticate, embeddingController.clearAndRegenerateServiceEmbeddings);

/**
 * @swagger
 * /api/embeddings/services/debug/chunks:
 *   get:
 *     summary: Debug service chunks (get all chunks)
 *     tags: [Embeddings, Debug]
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *         description: Optional service ID to filter chunks
 *     responses:
 *       200:
 *         description: Service chunks data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chunks:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *       500:
 *         description: Server error
 */
router.get('/services/debug/chunks', embeddingController.debugServiceChunks);

/**
 * @swagger
 * /api/embeddings/services/debug/chunks/{serviceId}:
 *   get:
 *     summary: Debug service chunks for a specific service
 *     tags: [Embeddings, Debug]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service chunks data for specific service
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chunks:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *       500:
 *         description: Server error
 */
router.get('/services/debug/chunks/:serviceId', embeddingController.debugServiceChunks);

/**
 * @swagger
 * /api/embeddings/services/debug/search:
 *   get:
 *     summary: Debug service search with similarity scores
 *     tags: [Embeddings, Debug]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search results with debug information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 query:
 *                   type: string
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Server error
 */
router.get('/services/debug/search', embeddingController.debugSearchServices);

// Public route for regenerating service embeddings (for testing)
router.post('/services/regenerate-all', embeddingController.generateEmbeddingsForAllServices);

// ===== DOCUMENT EMBEDDING ENDPOINTS =====

/**
 * @swagger
 * /api/embeddings/documents/generate-all:
 *   post:
 *     summary: Generate embeddings for all documents
 *     tags: [Embeddings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Embeddings generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post('/documents/generate-all', authenticate, embeddingController.generateEmbeddingsForAllDocuments);

/**
 * @swagger
 * /api/embeddings/documents/{id}/generate:
 *   post:
 *     summary: Generate embeddings for a specific document
 *     tags: [Embeddings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Embeddings generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.post('/documents/:id/generate', authenticate, embeddingController.generateEmbeddingForDocument);

/**
 * @swagger
 * /api/embeddings/documents/search:
 *   get:
 *     summary: Search documents using semantic search
 *     tags: [Embeddings]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Server error
 */
router.get('/documents/search', embeddingController.searchDocuments);

// Public route for regenerating document embeddings (for testing)
router.post('/documents/regenerate-all', embeddingController.generateEmbeddingsForAllDocuments);

export default router; 