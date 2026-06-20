import { Request, Response, NextFunction } from 'express';
import { WordService } from '../services/WordService';

export const WordController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { wordCard, suggestedImages } = await WordService.createWord(
        req.user.uid,
        req.body
      );
      res.status(201).json({ wordCard, suggestedImages });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const wordCard = await WordService.updateWord(
        req.user.uid,
        req.params.wordId,
        req.body
      );
      res.json({ wordCard });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const words = await WordService.listWords(req.user.uid);
      res.json({ words });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await WordService.deleteWord(req.user.uid, req.params.wordId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
