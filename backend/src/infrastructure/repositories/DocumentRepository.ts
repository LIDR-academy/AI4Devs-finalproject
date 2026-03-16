import { PrismaClient } from '@prisma/client';
import { Document, DocumentStatus } from '../../domain/entities/Document';
import logger from '../../utils/logger';

export interface DocumentSearchOptions {
  userId?: string;
  status?: DocumentStatus;
  limit?: number;
  offset?: number;
}

export interface DocumentChunkData {
  id: string;
  content: string;
  pageNumber?: number;
  chunkIndex: number;
  embedding?: number[];
}

export class DocumentRepository {
  constructor(private prisma: PrismaClient) {}

  async create(document: Document): Promise<Document> {
    try {
      const created = await this.prisma.document.create({
        data: {
          id: document.id,
          filename: document.filename,
          originalName: document.originalName,
          mimeType: document.mimeType,
          size: document.size,
          uploadPath: document.uploadPath,
          status: document.status,
          userId: document.userId,
          metadata: document.metadata ? JSON.stringify(document.metadata) : null,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt
        }
      });

      return this.toDomainEntity(created);
    } catch (error) {
      logger.error('Error creating document:', error);
      throw new Error('Failed to create document');
    }
  }

  async findById(id: string): Promise<Document | null> {
    try {
      const document = await this.prisma.document.findUnique({
        where: { id },
        include: {
          chunks: true
        }
      });

      return document ? this.toDomainEntity(document) : null;
    } catch (error) {
      logger.error('Error finding document by ID:', error);
      throw new Error('Failed to find document');
    }
  }

  async findByUserId(userId: string, options: DocumentSearchOptions = {}): Promise<Document[]> {
    try {
      const documents = await this.prisma.document.findMany({
        where: {
          userId,
          status: options.status
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: options.limit,
        skip: options.offset
      });

      return documents.map(doc => this.toDomainEntity(doc));
    } catch (error) {
      logger.error('Error finding documents by user ID:', error);
      throw new Error('Failed to find documents');
    }
  }

  async updateStatus(id: string, status: DocumentStatus): Promise<Document | null> {
    try {
      const updated = await this.prisma.document.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date()
        }
      });

      return this.toDomainEntity(updated);
    } catch (error) {
      logger.error('Error updating document status:', error);
      throw new Error('Failed to update document status');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.document.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      logger.error('Error deleting document:', error);
      return false;
    }
  }

  async createChunks(documentId: string, chunks: DocumentChunkData[]): Promise<void> {
    try {
      // Delete existing chunks first
      await this.prisma.documentChunk.deleteMany({
        where: { documentId }
      });

      // Create new chunks
      await this.prisma.documentChunk.createMany({
        data: chunks.map(chunk => ({
          id: chunk.id,
          content: chunk.content,
          pageNumber: chunk.pageNumber,
          chunkIndex: chunk.chunkIndex,
          documentId,
          embedding: chunk.embedding ? JSON.stringify(chunk.embedding) : null
        }))
      });

      logger.info(`Created ${chunks.length} chunks for document ${documentId}`);
    } catch (error) {
      logger.error('Error creating document chunks:', error);
      throw new Error('Failed to create document chunks');
    }
  }

  async getChunks(documentId: string): Promise<DocumentChunkData[]> {
    try {
      const chunks = await this.prisma.documentChunk.findMany({
        where: { documentId },
        orderBy: { chunkIndex: 'asc' }
      });

      return chunks.map(chunk => ({
        id: chunk.id,
        content: chunk.content,
        pageNumber: chunk.pageNumber || undefined,
        chunkIndex: chunk.chunkIndex,
        embedding: chunk.embedding ? JSON.parse(chunk.embedding) : undefined
      }));
    } catch (error) {
      logger.error('Error getting document chunks:', error);
      throw new Error('Failed to get document chunks');
    }
  }

  async searchChunks(queryEmbedding: number[], limit: number = 5): Promise<Array<DocumentChunkData & { similarity: number; documentId: string }>> {
    try {
      // Get all chunks with embeddings
      const chunks = await this.prisma.documentChunk.findMany({
        where: {
          embedding: {
            not: null
          }
        },
        include: {
          document: {
            select: {
              id: true,
              originalName: true,
              status: true
            }
          }
        }
      });

      // Calculate similarities
      const chunksWithSimilarity = chunks
        .map(chunk => {
          try {
            const chunkEmbedding = JSON.parse(chunk.embedding || '[]');
            const similarity = this.cosineSimilarity(queryEmbedding, chunkEmbedding);
            
            return {
              id: chunk.id,
              content: chunk.content,
              pageNumber: chunk.pageNumber || undefined,
              chunkIndex: chunk.chunkIndex,
              embedding: chunkEmbedding,
              similarity,
              documentId: chunk.documentId
            };
          } catch (error) {
            logger.error(`Error parsing embedding for chunk ${chunk.id}:`, error);
            return null;
          }
        })
        .filter((chunk): chunk is NonNullable<typeof chunk> => chunk !== null)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return chunksWithSimilarity;
    } catch (error) {
      logger.error('Error searching document chunks:', error);
      throw new Error('Failed to search document chunks');
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private toDomainEntity(prismaDocument: any): Document {
    return new Document(
      prismaDocument.id,
      prismaDocument.filename,
      prismaDocument.originalName,
      prismaDocument.mimeType,
      prismaDocument.size,
      prismaDocument.uploadPath,
      prismaDocument.status as DocumentStatus,
      prismaDocument.userId,
      prismaDocument.metadata ? JSON.parse(prismaDocument.metadata) : undefined,
      prismaDocument.createdAt,
      prismaDocument.updatedAt
    );
  }
} 