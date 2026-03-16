import { DynamicTool } from '@langchain/core/tools';
import logger from '../../../utils/logger';
import { availableFunctions } from '../../availableFunctions';

export const createServicesTool = () => {
  return new DynamicTool({
    name: 'getServices',
    description: `Get services offered by Gusto Italiano with optional filters.
    
    Use this tool when customers ask about:
    - Services, offerings, or what we provide
    - Consultations, classes, or workshops
    - Gift services, catering, or events
    - Subscription boxes or special services
    - Pricing for services
    - Wine pairing or cooking assistance
    
    Parameters:
    - isActive: Whether to return only active services (default: true)
    - search: Search by name or description
    - tags: Filter by tags (e.g., ["italian", "premium", "quick"])`,
    
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
        
        logger.info('LangChain Services Tool called with params:', params);
        
        // Call the existing function
        const result = await availableFunctions.getServices(params);
        
        logger.info('Services Tool result:', {
          total: result.total,
          serviceCount: result.services?.length,
          hasError: !!result.error
        });
        
        // Return formatted result for the LLM
        return JSON.stringify(result, null, 2);
        
      } catch (error) {
        logger.error('Error in Services Tool:', error);
        return JSON.stringify({
          error: 'Failed to retrieve services',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });
}; 