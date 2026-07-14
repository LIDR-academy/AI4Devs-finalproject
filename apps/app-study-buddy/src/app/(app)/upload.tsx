import { ScreenContainer } from '@helsoft/components';
import { ApiKeyGate, LessonGeneration, PdfDocuments, PdfUpload } from '@helsoft/study-buddy';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

export default function UploadScreen() {
  // Composition glue only (pending-pdfs-generate decision #5 + R2 decision #9):
  // lifted documentId feeds LessonGeneration; reloadToken refetches PdfDocuments.
  const [documentId, setDocumentId] = useState<string | undefined>(undefined);
  const [reloadToken, setReloadToken] = useState(0);
  const router = useRouter();

  const bumpReload = useCallback(() => {
    setReloadToken((n) => n + 1);
  }, []);

  const handleExtracted = useCallback(
    (id: string) => {
      setDocumentId(id);
      bumpReload();
    },
    [bumpReload],
  );

  const handleOpenLesson = useCallback(
    (lessonId: string) => {
      router.push({ pathname: '/lesson/[id]', params: { id: lessonId } });
    },
    [router],
  );

  return (
    <ScreenContainer>
      <ApiKeyGate>
        <PdfUpload onExtracted={handleExtracted} />
        <PdfDocuments
          onGenerate={setDocumentId}
          onOpenLesson={handleOpenLesson}
          reloadToken={reloadToken}
        />
        <LessonGeneration documentId={documentId} onGenerated={bumpReload} />
      </ApiKeyGate>
    </ScreenContainer>
  );
}
