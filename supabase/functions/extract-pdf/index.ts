// extract-pdf — Edge Function orchestration glue (task-3 happy path, Slice 1; task-9 typed
// error contract + failure cleanup, Slice 2).
//
// TESTING BOUNDARY (explicit, human-approved sandbox adaptation — see
// docs/features/pdf-upload-extraction/tdd.md and risk R4): this sandbox has no Deno CLI, so this
// file (and everything under ./_shared/) is NOT executed or type-checked here. The extraction
// LOGIC it calls — adapter, downscale, DTO shaping, failure detection — is implemented as pure
// TypeScript with no Deno-specific globals, Jest-tested for real in
// libs/services/src/pdf-extraction/, and manually mirrored into ./_shared/ (kept in sync by
// hand). This file is the actual Deno deployment source for the orchestration glue itself
// (storage I/O, auth, persistence) — verify it manually against a real PDF after `supabase
// functions deploy` in a real environment; never run `supabase functions deploy` from this
// pipeline (out of scope — a manual step later).
import { createClient } from 'npm:@supabase/supabase-js@2';

import { corsHeaders, corsPreflightResponse } from '../_shared/cors.ts';
import { buildPdfExtractionResult } from './_shared/extraction-dto.ts';
import { detectExtractionFailure } from './_shared/extraction-failure-detection.ts';
import { isFileTooLarge } from './_shared/file-size-guard.ts';
import { downscaleImage } from './_shared/image-downscale.ts';
import { MupdfExtractionAdapter } from './_shared/mupdf-extraction-adapter.ts';
import {
  PDF_EXTRACTION_LIMITS,
  PDF_IMAGES_BUCKET,
  PDF_UPLOAD_BUCKET,
  SCANNED_DETECTION_MIN_TEXT_LENGTH,
} from './_shared/pdf-extraction.constants.ts';
import type { ExtractedImageRef, PdfExtractionErrorCode } from './_shared/types.ts';

const EXTENSION_BY_MIME_TYPE: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png' };

type ExtractPdfRequestBody = {
  documentId: string;
};

const jsonResponse = (req: Request, body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  });

// deno-lint-ignore no-explicit-any
type AnySupabaseClient = any;

/** Marks the row failed with the given typed code (task-9) — the single place every failure
 * path below funnels through, so `status`/`error_code` are always set together and no caller
 * forgets one or the other. */
const markDocumentFailed = (
  supabase: AnySupabaseClient,
  documentId: string,
  errorCode: PdfExtractionErrorCode,
): Promise<unknown> => supabase.from('documents').update({ status: 'failed', error_code: errorCode }).eq('id', documentId);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse(req);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse(req, { errorCode: 'unauthenticated' }, 401);
  }

  // Scoped to the caller's own JWT (forwarded, not the service-role key) — every read/write below
  // runs as the authenticated user, so RLS enforces @s14's per-user isolation. No service-role
  // key is ever exposed to the client.
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return jsonResponse(req, { errorCode: 'unauthenticated' }, 401);
  }

  const { documentId } = (await req.json()) as ExtractPdfRequestBody;

  const { data: documentRow, error: documentError } = await supabase
    .from('documents')
    .select('filename')
    .eq('id', documentId)
    .single();
  if (documentError || !documentRow) {
    return jsonResponse(req, { errorCode: 'extraction_failed' }, 404);
  }

  try {
    const sourcePath = `${user.id}/${documentId}/source.pdf`;
    const { data: sourceBlob, error: downloadError } = await supabase.storage
      .from(PDF_UPLOAD_BUCKET)
      .download(sourcePath);
    if (downloadError || !sourceBlob) {
      throw new Error('source PDF not found');
    }

    // Server-authoritative size guard (M1, security review round-1 fix) — the client pre-check
    // (`pdf-extraction.service.ts`'s `validateFile`) is a UX fast-path only; a caller bypassing it
    // entirely must still be rejected here, on the actual downloaded object's own size, before any
    // parse/image work runs (no `.arrayBuffer()` read needed for the oversized case at all).
    if (isFileTooLarge(sourceBlob.size, PDF_EXTRACTION_LIMITS)) {
      await markDocumentFailed(supabase, documentId, 'file_too_large');
      return jsonResponse(req, { errorCode: 'file_too_large' }, 422);
    }

    const sourceBytes = new Uint8Array(await sourceBlob.arrayBuffer());

    // Parse/open failure (damaged, encrypted, or otherwise unparseable, @s12) is its own,
    // narrowly-scoped try/catch — distinct from the generic extraction_failed catch-all below —
    // so a corrupt file gets its own clear error rather than the generic one.
    let pages: Awaited<ReturnType<typeof MupdfExtractionAdapter.extract>>['pages'];
    let rawImages: Awaited<ReturnType<typeof MupdfExtractionAdapter.extract>>['images'];
    try {
      ({ pages, images: rawImages } = await MupdfExtractionAdapter.extract(sourceBytes));
    } catch (_parseCause) {
      await markDocumentFailed(supabase, documentId, 'corrupt_or_unreadable');
      return jsonResponse(req, { errorCode: 'corrupt_or_unreadable' }, 422);
    }

    // Structural/content guards (@s8 scanned-detection, @s11 page-count) run over the parsed
    // result BEFORE any image processing or persistence — a document that's going to be rejected
    // never gets a single document_images row or a page_count/pages write (task-9's "no partial
    // usable source retained").
    const failureCode = detectExtractionFailure({ pages }, PDF_EXTRACTION_LIMITS, SCANNED_DETECTION_MIN_TEXT_LENGTH);
    if (failureCode) {
      await markDocumentFailed(supabase, documentId, failureCode);
      return jsonResponse(req, { errorCode: failureCode }, 422);
    }

    // Downscale every image in memory first (pure, no I/O) — a failure here aborts before any
    // storage/DB write, same "no partial persistence" reasoning as the guards above.
    const downscaledImages = [];
    for (const rawImage of rawImages) {
      const downscaled = await downscaleImage(rawImage);
      if (!downscaled) continue; // decorative image, dropped per spec decision #4
      downscaledImages.push({ rawImage, downscaled });
    }

    // Only once every image is successfully downscaled do we touch storage/DB: upload every
    // object concurrently (N4, performance review round-1 fix — the independent per-image
    // uploads don't need to run serialized against each other), then persist every
    // document_images row in a single batch insert (rather than one insert per image) so a
    // failure in any upload never leaves some rows committed and others missing.
    const imageRows = await Promise.all(
      downscaledImages.map(async ({ rawImage, downscaled }) => {
        const extension = EXTENSION_BY_MIME_TYPE[downscaled.mimeType] ?? 'jpg';
        const storagePath = `${user.id}/${documentId}/p${rawImage.page}-${rawImage.positionIndex}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(PDF_IMAGES_BUCKET)
          .upload(storagePath, downscaled.bytes, { contentType: downscaled.mimeType, upsert: true });
        if (uploadError) throw uploadError;

        return {
          document_id: documentId,
          page_number: rawImage.page,
          position_index: rawImage.positionIndex,
          storage_path: storagePath,
          width: downscaled.width,
          height: downscaled.height,
          mime_type: downscaled.mimeType,
        };
      }),
    );

    const imageRefs: ExtractedImageRef[] = [];
    if (imageRows.length > 0) {
      const { data: insertedImageRows, error: insertError } = await supabase
        .from('document_images')
        .insert(imageRows)
        .select('id, page_number, position_index, storage_path, width, height, mime_type');
      if (insertError || !insertedImageRows) throw insertError ?? new Error('image rows insert failed');

      for (const row of insertedImageRows) {
        imageRefs.push({
          id: row.id,
          documentId,
          pageNumber: row.page_number,
          positionIndex: row.position_index,
          storagePath: row.storage_path,
          width: row.width,
          height: row.height,
          mimeType: row.mime_type,
        });
      }
    }

    const { error: updateError } = await supabase
      .from('documents')
      .update({ pages, page_count: pages.length, status: 'extracted' })
      .eq('id', documentId);
    if (updateError) throw updateError;

    const result = buildPdfExtractionResult({
      documentId,
      filename: documentRow.filename,
      pages,
      images: imageRefs,
    });

    return jsonResponse(req, result, 200);
  } catch (_cause) {
    await markDocumentFailed(supabase, documentId, 'extraction_failed');
    return jsonResponse(req, { errorCode: 'extraction_failed' }, 500);
  }
});
