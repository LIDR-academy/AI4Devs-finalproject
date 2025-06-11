import { DynamicTool } from '@langchain/core/tools';
import logger from '../../../utils/logger';
import { availableFunctions } from '../../availableFunctions';

export const createFAQsTool = () => {
  return new DynamicTool({
    name: 'getFAQs',
    description: `Get frequently asked questions from Gusto Italiano with semantic search capabilities.
    
    Use this tool when customers ask about:
    - Policies, procedures, or how things work
    - Shipping, delivery, or logistics questions
    - Returns, refunds, or exchanges
    - Payment methods or billing
    - General questions about the store
    - Help or support topics
    
    This tool uses semantic search with embeddings when a search term is provided.
    
    Parameters:
    - category: Filter by category (e.g., "Shipping & Delivery", "Returns & Refunds")
    - search: Search by question or answer content using semantic search`,
    
    func: async (input: string) => {
      try {
        // Parse the input parameters
        let params: any = {};
        
        try {
          params = JSON.parse(input);
        } catch {
          // If input is not JSON, treat it as a search term
          params = { search: input };
        }
        
        logger.info('LangChain FAQs Tool called with params:', params);
        
        // Call the existing function
        const result = await availableFunctions.getFAQs(params);
        
        logger.info('FAQs Tool result:', {
          total: result.total,
          faqCount: result.faqs?.length,
          hasError: !!result.error,
          searchTerm: params.search
        });
        
        // Return formatted result for the LLM
        return JSON.stringify(result, null, 2);
        
      } catch (error) {
        logger.error('Error in FAQs Tool:', error);
        return JSON.stringify({
          error: 'Failed to retrieve FAQs',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });
}; 