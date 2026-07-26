import { WordService } from '../services/WordService';
import { WordRepository } from '../repositories/WordRepository';
import { generateDefinition } from '../integrations/claudeClient';
import { searchImages } from '../integrations/unsplashClient';
import { ConflictError, NotFoundError } from '../middleware/errorHandler';
import { WordCard, UnsplashImage } from '../types';

jest.mock('../repositories/WordRepository');
jest.mock('../integrations/claudeClient');
jest.mock('../integrations/unsplashClient');

const mockRepo = WordRepository as jest.Mocked<typeof WordRepository>;
const mockGenDef = generateDefinition as jest.MockedFunction<typeof generateDefinition>;
const mockSearch = searchImages as jest.MockedFunction<typeof searchImages>;

const mockWordCard: WordCard = {
  id: 'word-001',
  userId: 'user-test',
  term: 'serendipity',
  normalizedTerm: 'serendipity',
  definition: 'Un hallazgo afortunado e inesperado',
  definitionLanguage: 'es',
  imageUrl: 'https://images.unsplash.com/photo-1',
  unsplashPhotoId: 'photo-1',
  status: 'active',
  learnedAt: null,
  createdAt: new Date('2026-06-01'),
  updatedAt: new Date('2026-06-01'),
};

const mockImages: UnsplashImage[] = [
  { photoId: 'photo-1', url: 'https://img1.jpg', thumbnailUrl: 'https://thumb1.jpg', photographer: 'John' },
  { photoId: 'photo-2', url: 'https://img2.jpg', thumbnailUrl: 'https://thumb2.jpg', photographer: 'Jane' },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('WordService.createWord', () => {
  it('crea una nueva tarjeta con definición e imágenes', async () => {
    mockRepo.findByNormalizedTerm.mockResolvedValue(null);
    mockGenDef.mockResolvedValue('Un hallazgo afortunado e inesperado');
    mockSearch.mockResolvedValue(mockImages);
    mockRepo.create.mockResolvedValue(mockWordCard);

    const result = await WordService.createWord('user-test', {
      term: 'serendipity',
      definitionLanguage: 'es',
    });

    expect(result.wordCard).toEqual(mockWordCard);
    expect(result.suggestedImages).toEqual(mockImages);
    expect(mockRepo.findByNormalizedTerm).toHaveBeenCalledWith('user-test', 'serendipity');
    expect(mockGenDef).toHaveBeenCalledWith('serendipity', 'es');
    expect(mockSearch).toHaveBeenCalledWith('serendipity', 5);
  });

  it('normaliza el término a minúsculas y sin espacios', async () => {
    mockRepo.findByNormalizedTerm.mockResolvedValue(null);
    mockGenDef.mockResolvedValue('Definition');
    mockSearch.mockResolvedValue([]);
    mockRepo.create.mockResolvedValue({ ...mockWordCard, term: 'Serendipity', normalizedTerm: 'serendipity' });

    await WordService.createWord('user-test', { term: '  Serendipity  ', definitionLanguage: 'es' });

    expect(mockRepo.findByNormalizedTerm).toHaveBeenCalledWith('user-test', 'serendipity');
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ term: 'Serendipity', normalizedTerm: 'serendipity' })
    );
  });

  it('lanza ConflictError si la palabra ya existe para ese usuario', async () => {
    mockRepo.findByNormalizedTerm.mockResolvedValue(mockWordCard);

    await expect(
      WordService.createWord('user-test', { term: 'serendipity', definitionLanguage: 'es' })
    ).rejects.toThrow(ConflictError);

    expect(mockGenDef).not.toHaveBeenCalled();
    expect(mockSearch).not.toHaveBeenCalled();
  });

  it('lanza ConflictError con código DUPLICATE_TERM', async () => {
    mockRepo.findByNormalizedTerm.mockResolvedValue(mockWordCard);

    await expect(
      WordService.createWord('user-test', { term: 'serendipity', definitionLanguage: 'es' })
    ).rejects.toMatchObject({ statusCode: 409, errorCode: 'DUPLICATE_TERM' });
  });

  it('llama a Claude y Unsplash en paralelo (Promise.all)', async () => {
    const callOrder: string[] = [];
    mockRepo.findByNormalizedTerm.mockResolvedValue(null);
    mockGenDef.mockImplementation(async () => { callOrder.push('claude'); return 'def'; });
    mockSearch.mockImplementation(async () => { callOrder.push('unsplash'); return []; });
    mockRepo.create.mockResolvedValue(mockWordCard);

    await WordService.createWord('user-test', { term: 'serendipity', definitionLanguage: 'es' });

    expect(callOrder).toContain('claude');
    expect(callOrder).toContain('unsplash');
    expect(mockGenDef).toHaveBeenCalledTimes(1);
    expect(mockSearch).toHaveBeenCalledTimes(1);
  });
});

describe('WordService.updateWord', () => {
  it('actualiza la tarjeta correctamente', async () => {
    const updated = { ...mockWordCard, imageUrl: 'https://new-img.jpg' };
    mockRepo.update.mockResolvedValue(updated);

    const result = await WordService.updateWord('user-test', 'word-001', {
      imageUrl: 'https://new-img.jpg',
    });

    expect(result.imageUrl).toBe('https://new-img.jpg');
    expect(mockRepo.update).toHaveBeenCalledWith('word-001', 'user-test', { imageUrl: 'https://new-img.jpg' });
  });

  it('lanza NotFoundError si la tarjeta no existe o pertenece a otro usuario', async () => {
    mockRepo.update.mockResolvedValue(null);

    await expect(
      WordService.updateWord('user-test', 'word-no-existe', {})
    ).rejects.toThrow(NotFoundError);
  });
});

describe('WordService.listWords', () => {
  it('devuelve todas las palabras del usuario', async () => {
    const words = [mockWordCard, { ...mockWordCard, id: 'word-002', term: 'ephemeral' }];
    mockRepo.findAllByUser.mockResolvedValue(words);

    const result = await WordService.listWords('user-test');

    expect(result).toHaveLength(2);
    expect(mockRepo.findAllByUser).toHaveBeenCalledWith('user-test');
  });

  it('devuelve array vacío si el usuario no tiene palabras', async () => {
    mockRepo.findAllByUser.mockResolvedValue([]);

    const result = await WordService.listWords('user-test');

    expect(result).toEqual([]);
  });
});

describe('WordService.deleteWord', () => {
  it('elimina la tarjeta correctamente', async () => {
    mockRepo.delete.mockResolvedValue(true);

    await expect(WordService.deleteWord('user-test', 'word-001')).resolves.not.toThrow();
    expect(mockRepo.delete).toHaveBeenCalledWith('word-001', 'user-test');
  });

  it('lanza NotFoundError si la tarjeta no existe o pertenece a otro usuario', async () => {
    mockRepo.delete.mockResolvedValue(false);

    await expect(
      WordService.deleteWord('user-test', 'word-no-existe')
    ).rejects.toThrow(NotFoundError);
  });
});
