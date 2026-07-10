// extract-pdf — Edge Function orchestration glue (task-3, pdf-upload-extraction, Slice 1).
//
// TESTING BOUNDARY (explicit, human-approved sandbox adaptation — see
// docs/features/pdf-upload-extraction/tdd.md and risk R4): this sandbox has no Deno CLI, so this
// file (and everything under ./_shared/) is NOT executed or type-checked here. The extraction
// LOGIC it calls — adapter, downscale, DTO shaping — is implemented as pure TypeScript with no
// Deno-specific globals, Jest-tested for real in libs/services/src/pdf-extraction/, and manually
// mirrored into ./_shared/ (kept in sync by hand). This file is the actual Deno deployment
// source for the orchestration glue itself (storage I/O, auth, persistence) — verify it manually
// against a real PDF after `supabase functions deploy` in a real environment; never run
// `supabase functions deploy` from this pipeline (out of scope — a manual step later).
import { createClient } from 'npm:@supabase/supabase-js@2';

import { buildPdfExtractionResult } from './_shared/extraction-dto.ts';
import { downscaleImage } from './_shared/image-downscale.ts';
import { MupdfExtractionAdapter } from './_shared/mupdf-extraction-adapter.ts';
import { PDF_IMAGES_BUCKET, PDF_UPLOAD_BUCKET } from './_shared/pdf-extraction.constants.ts';
import type { ExtractedImageRef } from './_shared/types.ts';

const EXTENSION_BY_MIME_TYPE: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png' };

type ExtractPdfRequestBody = {
  documentId: string;
};

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ errorCode: 'unauthenticated' }, 401);
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
    return jsonResponse({ errorCode: 'unauthenticated' }, 401);
  }

  const { documentId } = (await req.json()) as ExtractPdfRequestBody;

  const { data: documentRow, error: documentError } = await supabase
    .from('documents')
    .select('filename')
    .eq('id', documentId)
    .single();
  if (documentError || !documentRow) {
    return jsonResponse({ errorCode: 'extraction_failed' }, 404);
  }

  try {
    const sourcePath = `${user.id}/${documentId}/source.pdf`;
    const { data: sourceBlob, error: downloadError } = await supabase.storage
      .from(PDF_UPLOAD_BUCKET)
      .download(sourcePath);
    if (downloadError || !sourceBlob) {
      throw new Error('source PDF not found');
    }
    const sourceBytes = new Uint8Array(await sourceBlob.arrayBuffer());

    const { pages, images: rawImages } = await MupdfExtractionAdapter.extract(sourceBytes);

    const imageRefs: ExtractedImageRef[] = [];
    for (const rawImage of rawImages) {
      const downscaled = await downscaleImage(rawImage);
      if (!downscaled) continue; // decorative image, dropped per spec decision #4

      const extension = EXTENSION_BY_MIME_TYPE[downscaled.mimeType] ?? 'jpg';
      const storagePath = `${user.id}/${documentId}/p${rawImage.page}-${rawImage.positionIndex}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(PDF_IMAGES_BUCKET)
        .upload(storagePath, downscaled.bytes, { contentType: downscaled.mimeType, upsert: true });
      if (uploadError) throw uploadError;

      const { data: imageRow, error: insertError } = await supabase
        .from('document_images')
        .insert({
          document_id: documentId,
          page_number: rawImage.page,
          position_index: rawImage.positionIndex,
          storage_path: storagePath,
          width: downscaled.width,
          height: downscaled.height,
          mime_type: downscaled.mimeType,
        })
        .select('id')
        .single();
      if (insertError || !imageRow) throw insertError ?? new Error('image row insert failed');

      imageRefs.push({
        id: imageRow.id,
        documentId,
        pageNumber: rawImage.page,
        positionIndex: rawImage.positionIndex,
        storagePath,
        width: downscaled.width,
        height: downscaled.height,
        mimeType: downscaled.mimeType,
      });
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

    return jsonResponse(result, 200);
  } catch (_cause) {
    await supabase.from('documents').update({ status: 'failed', error_code: 'extraction_failed' }).eq('id', documentId);
    return jsonResponse({ errorCode: 'extraction_failed' }, 500);
  }
});
