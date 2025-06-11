import { DynamicTool } from '@langchain/core/tools';
import logger from '../../../utils/logger';
import { availableFunctions } from '../../availableFunctions';

export const createProductsTool = () => {
  return new DynamicTool({
    name: 'getProducts',
    description: `Get products from Gusto Italiano store with optional filters.
    
    Use this tool when customers ask about:
    - Products, items, or merchandise
    - Specific food categories (cheese, pasta, oils, vinegars, wine, etc.)
    - Italian specialties or regional products
    - Product searches or browsing
    - Inventory or availability questions
    
    Parameters:
    - category: Filter by category (e.g., "Cheese", "Oils", "Vinegars", "Pasta", "Wine")
    - search: Search by name or description
    - countOnly: Set to true to get only counts and categories`,
    
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
        
        logger.info('LangChain Products Tool called with params:', params);
        
        // Call the existing function
        const result = await availableFunctions.getProducts(params);
        
        logger.info('Products Tool result:', {
          total: result.total,
          productCount: result.products?.length,
          hasError: !!result.error
        });
        
        // Return formatted result for the LLM
        return JSON.stringify(result, null, 2);
        
      } catch (error) {
        logger.error('Error in Products Tool:', error);
        return JSON.stringify({
          error: 'Failed to retrieve products',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });
}; 