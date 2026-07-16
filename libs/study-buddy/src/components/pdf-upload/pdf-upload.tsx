import { PdfUploadPanel } from '@helsoft/components';

import type { PdfUploadProps } from './pdf-upload.types';
import { usePdfUpload } from './use-pdf-upload';

/**
 * PdfUpload — feature component wiring the document picker, `usePdfExtraction()`, and localized
 * strings to the presentational `PdfUploadPanel`. Mirrors the established `SignInForm`/
 * `LanguageSettings` wiring pattern. Maps every `PdfExtractionErrorCode` to its `t('upload.error.*')`
 * message and wires `retry()` into the panel's retry affordance (@s8-@s14, task-12).
 *
 * `onExtracted` (ai-lesson-generation decision #9) is additive/optional: fires once when
 * `usePdfExtraction()`'s own result first yields a `documentId`, so a sibling (`LessonGeneration`)
 * can learn it without `PdfUpload` giving up ownership of its own extraction lifecycle.
 */
export const PdfUpload = ({ onExtracted }: PdfUploadProps = {}) => {
  const { panelProps } = usePdfUpload({ onExtracted });
  return <PdfUploadPanel {...panelProps} />;
};
