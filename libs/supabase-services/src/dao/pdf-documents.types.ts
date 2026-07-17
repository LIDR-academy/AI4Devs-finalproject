/** Raw shape of a `user_documents` view row (snake_case, as Supabase returns it). */
export type UserDocumentRow = {
  id: string;
  filename: string;
  page_count: number | null;
  created_at: string;
  generation_error_code: string | null;
  lesson_id: string | null;
};
