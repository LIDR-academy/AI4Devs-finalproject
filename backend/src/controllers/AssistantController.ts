import { Request, Response, NextFunction } from 'express';
import { getOpenAIResponse } from '../services/OpenAIService';

export class AssistantController {
  async getResponse(req: Request, res: Response, next: NextFunction) {
    const { threadId, prompt } = req.body;
    try {
      const response = await getOpenAIResponse(threadId, prompt);
      res.json({ response });
    } catch (error) {
      next(error);
    }
  }
}