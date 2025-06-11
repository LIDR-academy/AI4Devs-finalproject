import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

const prisma = new PrismaClient();

export class AgentConfigService {
  /**
   * Get the latest agent configuration
   */
  async getLatestConfig() {
    try {
      // Get the most recently updated agent config
      const config = await prisma.agentConfig.findFirst({
        orderBy: { updatedAt: 'desc' },
      });
      
      // If no config exists, return null - let the caller handle defaults
      if (!config) {
        return null;
      }
      
      return {
        ...config,
        // Ensure model is always set to OpenRouter format
        model: config.model.includes('/') ? config.model : `openai/${config.model}`
      };
    } catch (error) {
      logger.error('Error getting agent config:', error);
      // Return default configuration if database fails
      return {
        id: 'default',
        name: 'Default Agent',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1.0,
        prompt: 'You are a helpful assistant.',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }
} 