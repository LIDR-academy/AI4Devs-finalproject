// generate-lesson -- the first LLM call in the repo (task-4, Slice 1: happy path for
// composition "both"; task-11 adds the other two compositions; task-12 adds the full typed
// error contract + the vision-model placement fallback + image degradation). This file is
// intentionally thin HTTP/Supabase/SDK wiring -- the actual decision logic (prompt building,
// deck-schema validation, composition enforcement, image placement, error mapping, deck
// assembly) lives in the pure, Jest-tested modules mirrored by hand into ./_shared/ (risks.md
// R2 -- Deno sits outside this sandbox's Jest/Stryker harness). Verify this file manually
// against a real extracted document after `supabase functions deploy` -- never run that command
// from this pipeline.
//
// SPIKE NOTE (risks.md R1, task-4 Gate note): this file has NOT been executed against a live
// Groq key in this sandbox (no Deno CLI, no network egress, no API key available here) -- the
// `@ai-sdk/groq` + `generateObject` call below is written against the SDK's documented shape but
// is an open manual-verification item for a human before merge/deploy (see tdd.md). If the SDK
// misbehaves in the real Edge runtime, fall back to a plain `fetch` to Groq's
// OpenAI-compatible endpoint behind this same `runGeneration` seam. The vision fallback (task-12,
// @s10) and the wall-clock timeout guard (@s15, risks.md R4) are new, equally unverified-live
// additions behind the same seam discipline.
import { createGroq } from 'npm:@ai-sdk/groq@4';
import { generateObject } from 'npm:ai@7';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@4';

import { assembleGeneratedLesson } from './_shared/lesson-generation.assembly.ts';
import { GenerationTimeoutError, mapGenerationError } from './_shared/lesson-generation.errors.ts';
import type { PageAnchoredImage, VisionPlacementDecision } from './_shared/lesson-generation.placement.ts';
import { placeImagesByMetadata } from './_shared/lesson-generation.placement.ts';
import { buildDeckPrompt, type PromptImageManifestEntry } from './_shared/lesson-generation.prompt.ts';
import { deckSchema } from './_shared/lesson-generation.schema.ts';
import { TEXT_MODEL_ID, VISION_MODEL_ID } from './_shared/models.ts';
import type {
  GeneratedLesson,
  GenerateLessonRequest,
  GenerationErrorCode,
  LessonComposition,
} from './_shared/types.ts';

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

// R1 migration decision #3 (20260710202811_pdf_extraction.sql) locked this bucket name; not
// re-exported from extract-pdf's own _shared (each function's _shared is deployed standalone).
const PDF_IMAGES_BUCKET = 'pdf-images';

// @s15/risks.md R4 -- bounds the whole generation pipeline (text call + the rare vision
// round-trip) to comfortably inside the PRD's ~30s target; a run that exceeds this is surfaced as
// the typed `timeout` code (mapGenerationError), never left to the platform's own hard cutoff.
const GENERATION_TIMEOUT_MS = 25_000;

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new GenerationTimeoutError()), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const visionDecisionResponseSchema = z.object({
  decisions: z.array(z.object({ imageId: z.string(), slideIndex: z.number().int().min(0).nullable() })),
});

type SlideAnchorSummary = { index: number; title: string; content: string };

/** The vision-model fallback (@s10, spec.md Open decision #7/#2) -- invoked only for images
 * metadata alone couldn't anchor (bounds cost, risks.md R4/R8), one call for every un-anchorable
 * image in the deck rather than one call per image. A malformed/partial vision response yields no
 * decision for an image, which `applyVisionPlacements` already degrades to text-only (@s12). */
const runVisionPlacement = async (
  apiKey: string,
  images: { imageId: string; bytes: Uint8Array }[],
  slides: SlideAnchorSummary[],
): Promise<VisionPlacementDecision[]> => {
  const groq = createGroq({ apiKey });
  const { object } = await generateObject({
    model: groq(VISION_MODEL_ID),
    schema: visionDecisionResponseSchema,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              'These images could not be placed using page metadata. Given these slides ' +
              `(index/title/content): ${JSON.stringify(slides)}, decide which slide index each ` +
              'image (in the given order, matched to the image ids below) best illustrates, or ' +
              `null to drop it. Image ids in order: ${images.map((image) => image.imageId).join(', ')}.`,
          },
          ...images.map((image) => ({ type: 'image' as const, image: image.bytes })),
        ],
      },
    ],
  });
  return object.decisions;
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
  const placementImages: PageAnchoredImage[] = images.map((image) => ({
    imageId: image.id,
    storagePath: image.storage_path,
    width: image.width,
    height: image.height,
    pageNumber: image.page_number,
    ...(image.description ? { alt: image.description } : {}),
  }));

  const generateLesson = async (): Promise<GeneratedLesson> => {
    const rawDeck = await runGeneration(keyRow.api_key, prompt);

    // Un-anchorable images (@s10) -- derived structurally from the model's own response, ahead
    // of assembleGeneratedLesson's own (re-)validation, so the vision call runs only for images
    // metadata genuinely can't place, bounding its cost (risks.md R4/R8).
    const rawSlides = (rawDeck as { slides?: { title?: string; content?: string; sourcePage?: number }[] })
      .slides ?? [];
    const anchors = rawSlides.map((slide, index) => ({ index, sourcePage: slide.sourcePage }));
    const { unplaced } = placeImagesByMetadata(anchors, placementImages);

    // @s12 -- downloading/deciding placement for an unplaced image never fails the request: a
    // broken storage ref is skipped (filtered out below) and any vision-call failure degrades
    // every still-unplaced image to text-only (empty decisions), rather than throwing.
    let visionDecisions: VisionPlacementDecision[] = [];
    if (unplaced.length > 0) {
      try {
        const downloaded = (
          await Promise.all(
            unplaced.map(async (image) => {
              const { data: blob } = await callerClient.storage
                .from(PDF_IMAGES_BUCKET)
                .download(image.storagePath);
              if (!blob) return null;
              return { imageId: image.imageId, bytes: new Uint8Array(await blob.arrayBuffer()) };
            }),
          )
        ).filter((entry): entry is { imageId: string; bytes: Uint8Array } => entry !== null);

        if (downloaded.length > 0) {
          const slideSummaries: SlideAnchorSummary[] = rawSlides.map((slide, index) => ({
            index,
            title: slide.title ?? '',
            content: slide.content ?? '',
          }));
          visionDecisions = await runVisionPlacement(keyRow.api_key, downloaded, slideSummaries);
        }
      } catch {
        visionDecisions = [];
      }
    }

    return assembleGeneratedLesson({
      composition,
      rawDeck,
      images: placementImages,
      visionDecisions,
    });
  };

  try {
    const lesson = await withTimeout(generateLesson(), GENERATION_TIMEOUT_MS);
    return jsonResponse(lesson, 200);
  } catch (cause) {
    // Redacted per @s8 -- never log the request body, the key, or the raw provider error; the
    // typed mapping below is the only thing derived from `cause`.
    const { errorCode, status } = mapGenerationError(cause);
    return errorResponse(errorCode, status);
  }
});
