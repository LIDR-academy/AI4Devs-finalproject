jest.mock('../dao/lesson-generation.dao', () => ({
  LessonGenerationDao: { generateLesson: jest.fn() },
}));

import type { GeneratedLesson } from '@helsoft/types';

import { LessonGenerationDao } from '../dao/lesson-generation.dao';
import { LessonGenerationService } from './lesson-generation.service';

const dao = LessonGenerationDao as jest.Mocked<typeof LessonGenerationDao>;

describe('LessonGenerationService', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s3/@s6 — a valid request from an authenticated caller is forwarded to the DAO as-is
  // (composition included) and its typed deck is returned unchanged.
  it('delegates a valid request to the DAO and returns the ordered typed deck', async () => {
    const lesson: GeneratedLesson = {
      lessonId: 'lesson-1',
      title: 'Photosynthesis',
      composition: 'both',
      slides: [],
    };
    dao.generateLesson.mockResolvedValue(lesson);

    const result = await LessonGenerationService.generate(
      { documentId: 'doc-1', composition: 'both' },
      'user-1',
    );

    expect(dao.generateLesson).toHaveBeenCalledWith({ documentId: 'doc-1', composition: 'both' });
    expect(result).toBe(lesson);
  });

  // Guard rail — an empty/missing userId never reaches the DAO; rejects with the typed
  // unauthenticated code (mirrors PdfExtractionService's own guard).
  it('rejects with unauthenticated and never calls the DAO when userId is empty', async () => {
    await expect(
      LessonGenerationService.generate({ documentId: 'doc-1', composition: 'both' }, ''),
    ).rejects.toMatchObject({ code: 'unauthenticated' });
    expect(dao.generateLesson).not.toHaveBeenCalled();
  });

  // Guard rail — a missing documentId never reaches the DAO; rejects with document_not_ready.
  it('rejects with document_not_ready and never calls the DAO when documentId is empty', async () => {
    await expect(
      LessonGenerationService.generate({ documentId: '', composition: 'both' }, 'user-1'),
    ).rejects.toMatchObject({ code: 'document_not_ready' });
    expect(dao.generateLesson).not.toHaveBeenCalled();
  });
});
