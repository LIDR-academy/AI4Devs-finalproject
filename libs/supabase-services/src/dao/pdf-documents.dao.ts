import type { PdfDocumentStatus, PdfDocumentSummary } from '@helsoft/types';

import { getSupabase } from '../supabase/supabase-client';

/** Raw shape of a `user_documents` view row (snake_case, as Supabase returns it). */
type UserDocumentRow = {
  id: string;
  filename: string;
  page_count: number | null;
  created_at: string;
  generation_error_code: string | null;
  lesson_id: string | null;
};

const PDF_UPLOAD_BUCKET = 'pdf-uploads';
const PDF_IMAGES_BUCKET = 'pdf-images';

const deriveStatus = (row: UserDocumentRow): PdfDocumentStatus => {
  if (row.lesson_id) return 'generated';
  if (row.generation_error_code) return 'failed';
  return 'ready';
};

const toPdfDocumentSummary = (row: UserDocumentRow): PdfDocumentSummary => {
  const status = deriveStatus(row);
  return {
    id: row.id,
    filename: row.filename,
    pageCount: row.page_count,
    createdAt: row.created_at,
    status,
    lessonId: status === 'generated' ? row.lesson_id : null,
  };
};

const removeBucketFolder = async (
  bucket: string,
  userId: string,
  documentId: string,
): Promise<void> => {
  const folder = `${userId}/${documentId}`;
  const { data: files, error: listError } = await getSupabase().storage.from(bucket).list(folder);
  if (listError) throw listError;
  if (!files?.length) return;

  const paths = files.map((file) => `${folder}/${file.name}`);
  const { error: removeError } = await getSupabase().storage.from(bucket).remove(paths);
  if (removeError) throw removeError;
};

/**
 * Raw Supabase data access for the PDF list. Reads the `user_documents` view (RLS via
 * `security_invoker`); never filters by a client-supplied user id (@s18). Delete purges
 * storage objects then the `documents` row (@s12/@s19).
 */
export abstract class PdfDocumentsDao {
  static async getDocuments(): Promise<PdfDocumentSummary[]> {
    const { data, error } = await getSupabase()
      .from('user_documents')
      .select('id, filename, page_count, created_at, generation_error_code, lesson_id')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as UserDocumentRow[]).map(toPdfDocumentSummary);
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
