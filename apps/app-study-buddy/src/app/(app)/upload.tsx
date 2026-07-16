import { ScreenContainer } from '@helsoft/components';
import {
  ApiKeyGate,
  NewLessonDialog,
  PdfDocuments,
  useApiKeyGateCanCreate,
} from '@helsoft/study-buddy';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

type UploadBodyProps = {
  reloadToken: number;
  generateDocumentId: string | undefined;
  onExtracted: () => void;
  onGenerated: () => void;
  onGenerateHandled: () => void;
  onGenerate: (documentId: string) => void;
  onOpenLesson: (lessonId: string) => void;
};

const UploadBody = ({
  reloadToken,
  generateDocumentId,
  onExtracted,
  onGenerated,
  onGenerateHandled,
  onGenerate,
  onOpenLesson,
}: UploadBodyProps) => {
  const canCreate = useApiKeyGateCanCreate();

  return (
    <>
      {canCreate ? (
        <NewLessonDialog
          onExtracted={onExtracted}
          onGenerated={onGenerated}
          generateDocumentId={generateDocumentId}
          onGenerateHandled={onGenerateHandled}
        />
      ) : null}
      <PdfDocuments
        onGenerate={canCreate ? onGenerate : undefined}
        onOpenLesson={onOpenLesson}
        reloadToken={reloadToken}
      />
    </>
  );
};

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
        <UploadBody
          reloadToken={reloadToken}
          generateDocumentId={generateDocumentId}
          onExtracted={handleExtracted}
          onGenerated={bumpReload}
          onGenerateHandled={() => setGenerateDocumentId(undefined)}
          onGenerate={setGenerateDocumentId}
          onOpenLesson={handleOpenLesson}
        />
      </ApiKeyGate>
    </ScreenContainer>
  );
}
