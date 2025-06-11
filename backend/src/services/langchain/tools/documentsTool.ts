import { DynamicTool } from '@langchain/core/tools';
import logger from '../../../utils/logger';
import { availableFunctions } from '../../availableFunctions';

interface DocumentSearchParams {
  search?: string;
  path?: string;
  limit?: number;
}

export function createDocumentsTool() {
  return new DynamicTool({
    name: 'getDocuments',
    description: 'Search and retrieve document information from our knowledge base. Use this when customers ask about documents, policies, regulations, catalogs, shipping laws, transportation rules, ocean shipping, international delivery, or any specific information that might be stored in our uploaded documents and PDFs.',
    func: async (input: string) => {
      try {
        // Parse input as JSON or use as search string
        let params: DocumentSearchParams = {};
        
        try {
          params = JSON.parse(input);
        } catch {
          // If not JSON, treat as search string
          params = { search: input };
        }

        const { search, path, limit = 5 } = params;
        
        logger.info(`getDocuments called with:`, { search, path, limit });

        // Use the real availableFunctions.getDocuments instead of hardcoded data
        const result = await availableFunctions.getDocuments({
          search,
          path,
          limit,
          isActive: true
        });

        logger.info(`Found ${result.documents?.length || 0} documents via ${result.searchType || 'unknown'} search`);

        return JSON.stringify(result);

      } catch (error) {
        logger.error('Error in getDocuments tool:', error);
        return JSON.stringify({
          documents: [],
          total: 0,
          error: 'Failed to retrieve documents',
          searchType: 'error'
        });
      }
    }
  });
} 