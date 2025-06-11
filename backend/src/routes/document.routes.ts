import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { SimpleDocumentController } from '../controllers/document.controller.simple';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const simpleDocumentController = new SimpleDocumentController();
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Document unique identifier
 *         filename:
 *           type: string
 *           description: Generated filename
 *         originalName:
 *           type: string
 *           description: Original filename
 *         title:
 *           type: string
 *           description: Document title
 *         size:
 *           type: integer
 *           description: File size in bytes
 *         status:
 *           type: string
 *           enum: [UPLOADING, PROCESSING, COMPLETED, FAILED]
 *           description: Processing status
 *         metadata:
 *           type: object
 *           description: PDF metadata
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     DocumentStats:
 *       type: object
 *       properties:
 *         totalDocuments:
 *           type: integer
 *         totalSize:
 *           type: integer
 *         statusBreakdown:
 *           type: object
 */

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload a PDF document
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to upload
 *               title:
 *                 type: string
 *                 description: Optional document title
 *             required:
 *               - document
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 document:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         description: Invalid file or validation error
 *       500:
 *         description: Server error
 */
router.post('/upload', authenticate, simpleDocumentController.uploadDocument);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get user documents
 *     tags: [Documents]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of documents to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of documents to skip
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, simpleDocumentController.getDocuments);

/**
 * @swagger
 * /api/documents/search:
 *   get:
 *     summary: Search documents
 *     tags: [Documents]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of documents to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of documents to skip
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *                 query:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.get('/search', authenticate, simpleDocumentController.searchDocuments);

/**
 * @swagger
 * /api/documents/stats:
 *   get:
 *     summary: Get document statistics
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: Document statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentStats'
 *       500:
 *         description: Server error
 */
router.get('/stats', authenticate, simpleDocumentController.getDocumentStats);

/**
 * @swagger
 * /api/documents/{id}/preview:
 *   get:
 *     summary: Preview document (serve PDF file)
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *       - in: query
 *         name: token
 *         required: false
 *         schema:
 *           type: string
 *         description: Authentication token (alternative to Authorization header)
 *     responses:
 *       200:
 *         description: PDF file content
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.get('/:id/preview', simpleDocumentController.previewDocument);

router.get('/:id', authenticate, simpleDocumentController.getDocumentById);
router.put('/:id', authenticate, simpleDocumentController.updateDocument);

// Temporary endpoint to fix S3 path migration
router.patch('/:id/fix-path', async (req, res) => {
  try {
    const { id } = req.params;
    const { uploadPath } = req.body;
    
    if (!uploadPath) {
      return res.status(400).json({ error: 'uploadPath is required' });
    }
    
    // Direct database update for S3 migration
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: { uploadPath }
    });
    
    res.json({ 
      message: 'Document path updated successfully',
      document: {
        id: updatedDocument.id,
        uploadPath: updatedDocument.uploadPath
      }
    });
  } catch (error) {
    console.error('Error updating document path:', error);
    res.status(500).json({ error: 'Failed to update document path' });
  }
});

router.delete('/:id', authenticate, simpleDocumentController.deleteDocument);

export default router; 