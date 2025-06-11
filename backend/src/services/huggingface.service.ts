import { HfInference } from '@huggingface/inference';
import logger from '../utils/logger';

class HuggingFaceService {
  private hf: HfInference;
  private readonly defaultModel = 'sentence-transformers/all-MiniLM-L6-v2'; // Fast and efficient embedding model

  constructor() {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      logger.warn('HUGGINGFACE_API_KEY not found in environment variables. HuggingFace embeddings will not work.');
      this.hf = new HfInference(); // Will use free tier with rate limits
    } else {
      this.hf = new HfInference(apiKey);
    }
  }

  /**
   * Generate embeddings for text using HuggingFace
   */
  async generateEmbedding(text: string, model?: string): Promise<number[]> {
    try {
      const modelToUse = model || this.defaultModel;
      
      logger.info(`Generating HuggingFace embedding for text: "${text.substring(0, 50)}..." using model: ${modelToUse}`);
      
      // Use feature extraction to get embeddings
      const response = await this.hf.featureExtraction({
        model: modelToUse,
        inputs: text
      });

      // HuggingFace returns embeddings as a nested array, we need to flatten it
      let embeddings: number[];
      
      if (Array.isArray(response) && Array.isArray(response[0])) {
        // If it's a 2D array, take the first row
        embeddings = response[0] as number[];
      } else if (Array.isArray(response)) {
        // If it's already a 1D array
        embeddings = response as number[];
      } else {
        throw new Error('Unexpected response format from HuggingFace API');
      }

      logger.info(`Generated HuggingFace embedding with ${embeddings.length} dimensions`);
      return embeddings;

    } catch (error) {
      logger.error('Error generating HuggingFace embedding:', error);
      
      // Fallback: return a zero vector of standard size (384 for all-MiniLM-L6-v2)
      const fallbackSize = 384;
      logger.warn(`Returning zero vector of size ${fallbackSize} as fallback`);
      return new Array(fallbackSize).fill(0);
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateEmbeddingsBatch(texts: string[], model?: string): Promise<number[][]> {
    try {
      const modelToUse = model || this.defaultModel;
      
      logger.info(`Generating HuggingFace embeddings for ${texts.length} texts using model: ${modelToUse}`);
      
      // Use feature extraction with multiple inputs
      const response = await this.hf.featureExtraction({
        model: modelToUse,
        inputs: texts
      });

      // Process the response
      let embeddings: number[][];
      
      if (Array.isArray(response) && Array.isArray(response[0])) {
        if (Array.isArray(response[0][0])) {
          // 3D array: [batch_size, sequence_length, embedding_dim] - take mean pooling
          embeddings = (response as number[][][]).map(batch => {
            // Mean pooling across sequence length
            const embeddingDim = batch[0].length;
            const meanEmbedding = new Array(embeddingDim).fill(0);
            
            for (const token of batch) {
              for (let i = 0; i < embeddingDim; i++) {
                meanEmbedding[i] += token[i];
              }
            }
            
            // Divide by sequence length
            for (let i = 0; i < embeddingDim; i++) {
              meanEmbedding[i] /= batch.length;
            }
            
            return meanEmbedding;
          });
        } else {
          // 2D array: [batch_size, embedding_dim]
          embeddings = response as number[][];
        }
      } else {
        throw new Error('Unexpected response format from HuggingFace API');
      }

      logger.info(`Generated ${embeddings.length} HuggingFace embeddings with ${embeddings[0]?.length || 0} dimensions each`);
      return embeddings;

    } catch (error) {
      logger.error('Error generating HuggingFace embeddings batch:', error);
      
      // Fallback: return zero vectors
      const fallbackSize = 384;
      logger.warn(`Returning ${texts.length} zero vectors of size ${fallbackSize} as fallback`);
      return texts.map(() => new Array(fallbackSize).fill(0));
    }
  }

  /**
   * Get available embedding models
   */
  getAvailableModels(): string[] {
    return [
      'sentence-transformers/all-MiniLM-L6-v2', // 384 dimensions, fast
      'sentence-transformers/all-mpnet-base-v2', // 768 dimensions, better quality
      'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2', // Multilingual
      'intfloat/e5-small-v2', // 384 dimensions, good performance
      'intfloat/e5-base-v2', // 768 dimensions, better quality
    ];
  }

  /**
   * Test the HuggingFace connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const testEmbedding = await this.generateEmbedding('test connection');
      return testEmbedding.length > 0 && testEmbedding.some(val => val !== 0);
    } catch (error) {
      logger.error('HuggingFace connection test failed:', error);
      return false;
    }
  }
}

export default new HuggingFaceService(); 