import { ScreenContainer } from '@helsoft/components';
import { ApiKeyGate, PdfUpload } from '@helsoft/study-buddy';

export default function UploadScreen() {
  return (
    <ScreenContainer>
      <ApiKeyGate>
        <PdfUpload />
      </ApiKeyGate>
    </ScreenContainer>
  );
}
