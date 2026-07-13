// generate-lesson -- the first LLM call in the repo (task-4, Slice 1: happy path for
// composition "both"; task-11/task-12 add the other two compositions + the full error
// contract + vision fallback). This file is intentionally thin HTTP/Supabase/SDK wiring --
// the actual decision logic (prompt building, deck-schema validation, composition enforcement,
// image placement, deck assembly) lives in the pure, Jest-tested modules mirrored by hand into
// ./_shared/ (risks.md R2 -- Deno sits outside this sandbox's Jest/Stryker harness). Verify
// this file manually against a real extracted document after `supabase functions deploy` --
// never run that command from this pipeline.
//
// SPIKE NOTE (risks.md R1, task-4 Gate note): this file has NOT been executed against a live
// Groq key in this sandbox (no Deno CLI, no network egress, no API key available here) -- the
// `@ai-sdk/groq` + `generateObject` call below is written against the SDK's documented shape but
// is an open manual-verification item for a human before merge/deploy (see tdd.md). If the SDK
// misbehaves in the real Edge runtime, fall back to a plain `fetch` to Groq's
// OpenAI-compatible endpoint behind this same `runGeneration` seam.
import { createGroq } from 'npm:@ai-sdk/groq@4';
import { generateObject } from 'npm:ai@7';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

import { assembleGeneratedLesson, GenerationSchemaError } from './_shared/lesson-generation.assembly.ts';
import type { PageAnchoredImage } from './_shared/lesson-generation.placement.ts';
import { buildDeckPrompt, type PromptImageManifestEntry } from './_shared/lesson-generation.prompt.ts';
import { deckSchema } from './_shared/lesson-generation.schema.ts';
import { TEXT_MODEL_ID } from './_shared/models.ts';
import type { GenerateLessonRequest, GenerationErrorCode, LessonComposition } from './_shared/types.ts';

// deno-lint-ignore no-explicit-any
type AnySupabaseClient = any;

type DocumentRow = { pages: { page: number; text: string }[]; status: string };

type DocumentImageRow = {
  id: string;
  page_number: number;
  position_index: number;
  storage_path: string;
  width: number;
  height: number;
  description: string | null;
};

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const errorResponse = (errorCode: GenerationErrorCode, status: number): Response =>
  jsonResponse({ errorCode }, status);

const isLessonComposition = (value: unknown): value is LessonComposition =>
  value === 'instructional-only' || value === 'activity-only' || value === 'both';

/** Runs the model call behind one seam so a `fetch`-based fallback (risks.md R1) can slot in
 * without touching any caller. */
const runGeneration = async (apiKey: string, prompt: string): Promise<unknown> => {
  const groq = createGroq({ apiKey });
  const { object } = await generateObject({
    model: groq(TEXT_MODEL_ID),
    schema: deckSchema,
    prompt,
  });
  return object;
};

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return errorResponse('unauthenticated', 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  // Scoped to the caller's own JWT -- every documents/document_images read below runs as the
  // authenticated user, so RLS enforces per-user isolation (mirrors extract-pdf).
  const callerClient: SupabaseClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await callerClient.auth.getUser();
  if (!user) {
    return errorResponse('unauthenticated', 401);
  }

  // Service-role client -- reaches the Vault-backed get_api_key() RPC only (spec.md Open
  // decision #6); never used for the documents/document_images reads above, which stay RLS-scoped.
  const adminClient: AnySupabaseClient = createClient(supabaseUrl, serviceRoleKey);

  let body: Partial<GenerateLessonRequest>;
  try {
    body = (await req.json()) as Partial<GenerateLessonRequest>;
  } catch {
    return errorResponse('document_not_ready', 400);
  }

  if (typeof body.documentId !== 'string' || !isLessonComposition(body.composition)) {
    return errorResponse('document_not_ready', 400);
  }
  const { documentId, composition } = body as GenerateLessonRequest;

  const { data: documentRow, error: documentError } = await callerClient
    .from('documents')
    .select('pages, status')
    .eq('id', documentId)
    .single();
  const document = documentRow as DocumentRow | null;
  if (documentError || !document || document.status !== 'extracted') {
    return errorResponse('document_not_ready', 422);
  }

  const { data: imageRows } = await callerClient
    .from('document_images')
    .select('id, page_number, position_index, storage_path, width, height, description')
    .eq('document_id', documentId);
  const images = (imageRows ?? []) as DocumentImageRow[];

  // @s7/@s8 -- the decrypted key is read only here, server-side, via the service-role-only RPC;
  // it is never included in any request/response body and never logged.
  const { data: keyRows } = await adminClient.rpc('get_api_key', { p_user_id: user.id });
  const keyRow = Array.isArray(keyRows) ? keyRows[0] : keyRows;
  if (!keyRow?.api_key) {
    return errorResponse('missing_key', 422);
  }

  const promptImages: PromptImageManifestEntry[] = images.map((image) => ({
    imageId: image.id,
    pageNumber: image.page_number,
    positionIndex: image.position_index,
    ...(image.description ? { description: image.description } : {}),
  }));
  const prompt = buildDeckPrompt({ composition, pages: document.pages, images: promptImages });

  try {
    const rawDeck = await runGeneration(keyRow.api_key, prompt);

    const placementImages: PageAnchoredImage[] = images.map((image) => ({
      imageId: image.id,
      storagePath: image.storage_path,
      width: image.width,
      height: image.height,
      pageNumber: image.page_number,
      ...(image.description ? { alt: image.description } : {}),
    }));

    const lesson = assembleGeneratedLesson({ composition, rawDeck, images: placementImages });
    return jsonResponse(lesson, 200);
  } catch (cause) {
    if (cause instanceof GenerationSchemaError) {
      return errorResponse('generation_failed', 502);
    }
    // Redacted per @s8 -- never log the request body, the key, or the raw provider error.
    return errorResponse('generation_failed', 502);
  }
});
