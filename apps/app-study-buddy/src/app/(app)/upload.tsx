import { ScreenContainer } from '@helsoft/components';
import { ApiKeyGate, NewLessonDialog, PdfDocuments } from '@helsoft/study-buddy';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

export default function UploadScreen() {
  const [reloadToken, setReloadToken] = useState(0);
  const [generateDocumentId, setGenerateDocumentId] = useState<string | undefined>(undefined);
  const router = useRouter();

  const bumpReload = useCallback(() => {
    setReloadToken((n) => n + 1);
  }, []);

  const handleExtracted = useCallback(() => {
    bumpReload();
  }, [bumpReload]);

  const handleOpenLesson = useCallback(
    (lessonId: string) => {
      router.push({ pathname: '/lesson/[id]/player', params: { id: lessonId } });
    },
    [router],
  );

  return (
    <ScreenContainer>
      <ApiKeyGate>
        <NewLessonDialog
          onExtracted={handleExtracted}
          onGenerated={bumpReload}
          generateDocumentId={generateDocumentId}
          onGenerateHandled={() => setGenerateDocumentId(undefined)}
        />
        <PdfDocuments
          onGenerate={setGenerateDocumentId}
          onOpenLesson={handleOpenLesson}
          reloadToken={reloadToken}
        />
      </ApiKeyGate>
    </ScreenContainer>
  );
}
