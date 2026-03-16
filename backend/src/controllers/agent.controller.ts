import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Default prompt in case validation fails but we need a fallback
const DEFAULT_PROMPT = `You are a helpful shopping assistant for an Italian food store called "Gusto Italiano". Help customers find authentic Italian products and answer questions about our products, shipping, returns, and other common inquiries.`;

// Validation schema
const agentConfigSchema = z.object({
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().min(1).max(4000),
  topP: z.number().min(0).max(1),
  model: z.string().min(1),
  prompt: z.string().min(1),
});

class AgentController {
  /**
   * Get the current agent configuration
   */
  async getAgentConfig(req: Request, res: Response) {
    try {
      const config = await prisma.agentConfig.findFirst();
      
      if (!config) {
        return res.status(404).json({ 
          error: 'No agent configuration found in database',
          message: 'Please contact support to configure the system'
        });
      }
      
      res.json(config);
    } catch (error) {
      logger.error('Error fetching agent configuration:', error);
      res.status(500).json({ error: 'Failed to fetch agent configuration' });
    }
  }

  async getAgentConfigHealth(req: Request, res: Response) {
    try {
      const config = await prisma.agentConfig.findFirst();
      const configCount = config ? 1 : 0;
      
      res.json({
        status: config ? 'healthy' : 'no_config',
        hasConfig: !!config,
        configCount,
        environment: process.env.NODE_ENV || 'unknown'
      });
    } catch (error) {
      logger.error('Error checking agent configuration health:', error);
      res.status(500).json({ 
        status: 'error',
        hasConfig: false,
        configCount: 0,
        error: 'Failed to check agent configuration'
      });
    }
  }

  /**
   * Update the agent configuration
   */
  async updateAgentConfig(req: Request, res: Response) {
    try {
      // Check if prompt is null or empty and set default if needed
      if (!req.body.prompt || req.body.prompt.trim() === '') {
        req.body.prompt = DEFAULT_PROMPT;
      }
      
      // Validate request body
      const validatedData = agentConfigSchema.parse(req.body);
      
      // Get the first agent config
      const existingConfig = await prisma.agentConfig.findFirst();
      
      let updatedConfig;
      
      if (existingConfig) {
        // Update existing config
        updatedConfig = await prisma.agentConfig.update({
          where: { id: existingConfig.id },
          data: {
            ...validatedData,
            updatedAt: new Date()
          }
        });
      } else {
        // Create new config if none exists
        updatedConfig = await prisma.agentConfig.create({
          data: {
            ...validatedData,
            updatedAt: new Date()
          }
        });
      }
      
      // Double-check that prompt is not null in the response
      if (!updatedConfig.prompt) {
        updatedConfig.prompt = DEFAULT_PROMPT;
      }
      
      return res.status(200).json(updatedConfig);
    } catch (error) {
      logger.error('Update agent configuration error:', error);
      
      // Handle validation errors
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }
      
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
}

export default new AgentController();