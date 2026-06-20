import { WordRepository } from '../repositories/WordRepository';
import { generateDefinition } from '../integrations/claudeClient';
import { searchImages } from '../integrations/unsplashClient';
import { ConflictError, NotFoundError } from '../middleware/errorHandler';
import {
  WordCard,
  UnsplashImage,
  CreateWordBody,
  UpdateWordBody,
} from '../types';

export const WordService = {
  async createWord(
    userId: string,
    body: CreateWordBody
  ): Promise<{ wordCard: WordCard; suggestedImages: UnsplashImage[] }> {
    const normalizedTerm = body.term.trim().toLowerCase();

    const existing = await WordRepository.findByNormalizedTerm(userId, normalizedTerm);
    if (existing) {
      throw new ConflictError(
        'DUPLICATE_TERM',
        `You already have a card for '${normalizedTerm}'`
      );
    }

    const [definition, suggestedImages] = await Promise.all([
      generateDefinition(body.term.trim(), body.definitionLanguage),
      searchImages(body.term.trim(), 5),
    ]);

    const wordCard = await WordRepository.create({
      userId,
      term: body.term.trim(),
      normalizedTerm,
      definition,
      definitionLanguage: body.definitionLanguage,
      imageUrl: '',
      unsplashPhotoId: null,
      status: 'active',
    });

    return { wordCard, suggestedImages };
  },

  async updateWord(
    userId: string,
    wordId: string,
    body: UpdateWordBody
  ): Promise<WordCard> {
    const updated = await WordRepository.update(wordId, userId, body);
    if (!updated) {
      throw new NotFoundError('Word card not found');
    }
    return updated;
  },

  async listWords(userId: string): Promise<WordCard[]> {
    return WordRepository.findAllByUser(userId);
  },

  async deleteWord(userId: string, wordId: string): Promise<void> {
    const deleted = await WordRepository.delete(wordId, userId);
    if (!deleted) {
      throw new NotFoundError('Word card not found');
    }
  },
};
