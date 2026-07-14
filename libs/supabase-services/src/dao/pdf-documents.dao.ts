import { getSupabase } from '../supabase/supabase-client';

/** Raw shape of a `user_documents` view row (snake_case, as Supabase returns it). */
export type UserDocumentRow = {
  id: string;
  filename: string;
  page_count: number | null;
  created_at: string;
  generation_error_code: string | null;
  lesson_id: string | null;
};

const PDF_UPLOAD_BUCKET = 'pdf-uploads';
const PDF_IMAGES_BUCKET = 'pdf-images';
/** Supabase Storage `list` default page size — paginate until empty (@s12). */
const STORAGE_LIST_PAGE_SIZE = 100;

const removeBucketFolder = async (
  bucket: string,
  userId: string,
  documentId: string,
): Promise<void> => {
  const folder = `${userId}/${documentId}`;
  for (;;) {
    const { data: files, error: listError } = await getSupabase()
      .storage.from(bucket)
      .list(folder, { limit: STORAGE_LIST_PAGE_SIZE, offset: 0 });
    if (listError) throw listError;
    if (!files?.length) return;

    const paths = files.map((file) => `${folder}/${file.name}`);
    const { error: removeError } = await getSupabase().storage.from(bucket).remove(paths);
    if (removeError) throw removeError;
    // Full page may leave residuals — keep listing from offset 0 after each remove.
    if (files.length < STORAGE_LIST_PAGE_SIZE) return;
  }
};

/**
 * Raw Supabase data access for the PDF list. Reads the `user_documents` view (RLS via
 * `security_invoker`); never filters by a client-supplied user id (@s18). Delete purges
 * storage objects then the `documents` row (@s12/@s19). Status derivation lives in the service.
 */
export abstract class PdfDocumentsDao {
  static async getDocuments(): Promise<UserDocumentRow[]> {
    const { data, error } = await getSupabase()
      .from('user_documents')
      .select('id, filename, page_count, created_at, generation_error_code, lesson_id')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as UserDocumentRow[]) ?? [];
  }

  /** Purges `pdf-images` + `pdf-uploads` objects for the doc, then deletes the row (RLS). */
  static async deleteDocument(documentId: string): Promise<void> {
    const {
      data: { user },
      error: userError,
    } = await getSupabase().auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('PdfDocumentsDao.deleteDocument: authenticated user required');

    await removeBucketFolder(PDF_IMAGES_BUCKET, user.id, documentId);
    await removeBucketFolder(PDF_UPLOAD_BUCKET, user.id, documentId);

    const { error } = await getSupabase().from('documents').delete().eq('id', documentId);
    if (error) throw error;
  }
}
