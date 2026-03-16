import { DynamicTool } from '@langchain/core/tools';
import logger from '../../../utils/logger';
import { availableFunctions } from '../../availableFunctions';

export function createProfileTool() {
  return new DynamicTool({
    name: 'getProfile',
    description: `Get company profile information including company name, description, website, email, opening hours, address, and business sector. 
    Use this when customers ask about:
    - Where the company is located
    - Company website or contact information
    - Opening hours or business hours
    - What the company does
    - Company address
    - How to contact the company
    Note: This does not include phone number for privacy reasons.`,
    func: async () => {
      try {
        logger.info('Profile tool called');
        const result = await availableFunctions.getProfile();
        
        if (result.error) {
          return `Error: ${result.error}`;
        }
        
        // Format the profile information for the AI
        const profileInfo = [
          `Company: ${result.companyName}`,
          `Description: ${result.description}`,
          result.website ? `Website: ${result.website}` : null,
          `Email: ${result.email}`,
          `Opening Hours: ${result.openingTime}`,
          `Address: ${result.address}`,
          `Business Sector: ${result.sector}`
        ].filter(Boolean).join('\n');
        
        logger.info('Profile information retrieved successfully');
        return profileInfo;
      } catch (error) {
        logger.error('Error in profile tool:', error);
        return 'Error: Unable to retrieve company profile information';
      }
    }
  });
} 