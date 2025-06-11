import { fileTypeFromBuffer } from 'file-type';
import pdfParse from 'pdf-parse';
import logger from '../utils/logger';
import { generateEmbedding } from '../utils/openai';

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pages?: number;
}

export interface TextChunk {
  content: string;
  pageNumber?: number;
  chunkIndex: number;
}

export interface ProcessedDocument {
  text: string;
  metadata: PDFMetadata;
  chunks: TextChunk[];
}

export class PDFProcessingService {
  private readonly MAX_CHUNK_SIZE = 1000; // characters
  private readonly CHUNK_OVERLAP = 200; // characters

  /**
   * Validate if the buffer contains a valid PDF file
   */
  async validatePDF(buffer: Buffer): Promise<boolean> {
    try {
      const fileType = await fileTypeFromBuffer(buffer);
      return fileType?.mime === 'application/pdf';
    } catch (error) {
      logger.error('Error validating PDF:', error);
      return false;
    }
  }

  /**
   * Extract text and metadata from PDF buffer
   */
  async extractTextFromPDF(buffer: Buffer): Promise<ProcessedDocument> {
    try {
      // Validate PDF first
      const isValidPDF = await this.validatePDF(buffer);
      if (!isValidPDF) {
        throw new Error('Invalid PDF file');
      }

      // Parse PDF
      const pdfData = await pdfParse(buffer);
      
      // Extract metadata
      const metadata: PDFMetadata = {
        title: pdfData.info?.Title || undefined,
        author: pdfData.info?.Author || undefined,
        subject: pdfData.info?.Subject || undefined,
        creator: pdfData.info?.Creator || undefined,
        producer: pdfData.info?.Producer || undefined,
        creationDate: pdfData.info?.CreationDate ? new Date(pdfData.info.CreationDate) : undefined,
        modificationDate: pdfData.info?.ModDate ? new Date(pdfData.info.ModDate) : undefined,
        pages: pdfData.numpages
      };

      // Clean and normalize text
      const cleanText = this.cleanText(pdfData.text);
      
      // Create chunks
      const chunks = this.createTextChunks(cleanText);

      logger.info(`PDF processed successfully: ${chunks.length} chunks created from ${metadata.pages} pages`);

      return {
        text: cleanText,
        metadata,
        chunks
      };

    } catch (error) {
      logger.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF file');
    }
  }

  /**
   * Clean and normalize extracted text
   */
  private cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove page breaks and form feeds
      .replace(/[\f\r]/g, '')
      // Remove multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  }

  /**
   * Split text into overlapping chunks for better context preservation
   */
  private createTextChunks(text: string): TextChunk[] {
    const chunks: TextChunk[] = [];
    let chunkIndex = 0;
    let startIndex = 0;

    while (startIndex < text.length) {
      let endIndex = startIndex + this.MAX_CHUNK_SIZE;
      
      // If we're not at the end of the text, try to break at a sentence or word boundary
      if (endIndex < text.length) {
        // Look for sentence boundary (. ! ?)
        const sentenceEnd = text.lastIndexOf('.', endIndex);
        const exclamationEnd = text.lastIndexOf('!', endIndex);
        const questionEnd = text.lastIndexOf('?', endIndex);
        
        const sentenceBoundary = Math.max(sentenceEnd, exclamationEnd, questionEnd);
        
        if (sentenceBoundary > startIndex + this.MAX_CHUNK_SIZE * 0.5) {
          endIndex = sentenceBoundary + 1;
        } else {
          // Fall back to word boundary
          const wordBoundary = text.lastIndexOf(' ', endIndex);
          if (wordBoundary > startIndex + this.MAX_CHUNK_SIZE * 0.5) {
            endIndex = wordBoundary;
          }
        }
      }

      const chunkContent = text.slice(startIndex, endIndex).trim();
      
      if (chunkContent.length > 0) {
        chunks.push({
          content: chunkContent,
          chunkIndex: chunkIndex++
        });
      }

      // Move start index with overlap
      startIndex = endIndex - this.CHUNK_OVERLAP;
      
      // Ensure we don't go backwards
      if (startIndex <= 0) {
        startIndex = endIndex;
      }
    }

    return chunks;
  }

  /**
   * Generate embeddings for document chunks
   */
  async generateEmbeddingsForChunks(chunks: TextChunk[]): Promise<Array<TextChunk & { embedding: number[] }>> {
    const chunksWithEmbeddings: Array<TextChunk & { embedding: number[] }> = [];

    for (const chunk of chunks) {
      try {
        const embedding = await generateEmbedding(chunk.content);
        chunksWithEmbeddings.push({
          ...chunk,
          embedding
        });
        
        logger.info(`Generated embedding for chunk ${chunk.chunkIndex}`);
      } catch (error) {
        logger.error(`Failed to generate embedding for chunk ${chunk.chunkIndex}:`, error);
        // Continue with other chunks even if one fails
        chunksWithEmbeddings.push({
          ...chunk,
          embedding: [] // Empty embedding as fallback
        });
      }
    }

    logger.info(`Generated embeddings for ${chunksWithEmbeddings.length} chunks`);
    return chunksWithEmbeddings;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
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

  /**
   * Search for relevant chunks based on query embedding
   */
  async searchSimilarChunks(
    queryEmbedding: number[], 
    documentChunks: Array<{ content: string; embedding: number[] }>,
    limit: number = 5,
    threshold: number = 0.7
  ): Promise<Array<{ content: string; similarity: number }>> {
    const similarities = documentChunks.map(chunk => ({
      content: chunk.content,
      similarity: this.cosineSimilarity(queryEmbedding, chunk.embedding)
    }));

    return similarities
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}

// Export singleton instance
export const pdfProcessingService = new PDFProcessingService(); 