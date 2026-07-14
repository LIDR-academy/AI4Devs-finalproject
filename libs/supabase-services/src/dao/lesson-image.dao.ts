import { getSupabase } from '../supabase/supabase-client';

const PDF_IMAGES_BUCKET = 'pdf-images';

/**
 * Raw Supabase storage access for lesson slide images (bucket `pdf-images`).
 */
export abstract class LessonImageDao {
  static async createSignedUrl(storagePath: string, expiresInSeconds: number): Promise<string> {
    const { data, error } = await getSupabase()
      .storage.from(PDF_IMAGES_BUCKET)
      .createSignedUrl(storagePath, expiresInSeconds);
    if (error) throw error;
    return data.signedUrl;
  }
}
