import { ScreenContainer } from '@helsoft/components';
import { ApiKeyGate, LessonGeneration, PdfUpload } from '@helsoft/study-buddy';
import { useState } from 'react';

export default function UploadScreen() {
  // The one handoff value this screen holds (ai-lesson-generation decision #9) — composition
  // state, orchestration, and error handling all stay in the libs, so this screen stays a thin
  // shell (routing + this single useState only).
  const [documentId, setDocumentId] = useState<string | undefined>(undefined);

  return (
    <ScreenContainer>
      <ApiKeyGate>
        <PdfUpload onExtracted={setDocumentId} />
        <LessonGeneration documentId={documentId} />
      </ApiKeyGate>
    </ScreenContainer>
  );
}
