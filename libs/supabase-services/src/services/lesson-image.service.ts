import { LessonImageDao } from '../dao/lesson-image.dao';

/** Short-lived signed URL TTL (seconds). */
const SIGNED_URL_TTL_SECONDS = 300;

/**
 * Resolves a short-lived signed URL for a slide image. Failure degrades to `null` (never throws).
 */
export abstract class LessonImageService {
  static async getSignedImageUrl(storagePath: string): Promise<string | null> {
    if (!storagePath.trim()) return null;
    try {
      return await LessonImageDao.createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);
    } catch {
      return null;
    }
  }
}
