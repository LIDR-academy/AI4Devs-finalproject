jest.mock('../dao/lesson-image.dao', () => ({
  LessonImageDao: { createSignedUrl: jest.fn() },
}));

import { LessonImageDao } from '../dao/lesson-image.dao';
import { LessonImageService } from './lesson-image.service';

const dao = LessonImageDao as jest.Mocked<typeof LessonImageDao>;

describe('LessonImageService', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s7 — resolves a usable signed URL from storagePath.
  it('getSignedImageUrl returns the signed URL from the DAO', async () => {
    dao.createSignedUrl.mockResolvedValue('https://example.com/signed.png');

    const url = await LessonImageService.getSignedImageUrl('user/doc/img.png');

    expect(dao.createSignedUrl).toHaveBeenCalledWith('user/doc/img.png', expect.any(Number));
    expect(url).toBe('https://example.com/signed.png');
  });

  // @s8/@s9 feed — failure degrades to null, never throws.
  it('getSignedImageUrl returns null when the DAO fails', async () => {
    dao.createSignedUrl.mockRejectedValue({ message: 'missing' });

    await expect(LessonImageService.getSignedImageUrl('missing.png')).resolves.toBeNull();
  });

  it('getSignedImageUrl returns null for a blank storagePath without calling the DAO', async () => {
    await expect(LessonImageService.getSignedImageUrl('')).resolves.toBeNull();
    await expect(LessonImageService.getSignedImageUrl('   ')).resolves.toBeNull();
    expect(dao.createSignedUrl).not.toHaveBeenCalled();
  });

  // Review r2 — path-shape / traversal rejection before DAO.
  it('getSignedImageUrl returns null for unsafe storagePath shapes without calling the DAO', async () => {
    await expect(LessonImageService.getSignedImageUrl('../secret.png')).resolves.toBeNull();
    await expect(LessonImageService.getSignedImageUrl('/abs/path.png')).resolves.toBeNull();
    await expect(LessonImageService.getSignedImageUrl('orphan.png')).resolves.toBeNull();
    expect(dao.createSignedUrl).not.toHaveBeenCalled();
  });
});
