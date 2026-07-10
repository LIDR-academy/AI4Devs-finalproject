import { PdfUploadPanel, type PdfUploadPanelState } from '@helsoft/components';
import { usePdfExtraction } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

const PDF_MIME_TYPE = 'application/pdf';

/** React Native's own ambient `Blob`/`File` global types (declared in `react-native/src/types/
 * globals.d.ts`, picked up automatically — no DOM lib in this tsconfig) don't declare
 * `arrayBuffer()`, even though a real web `File` (what `asset.file` actually is at runtime on
 * web) always has it. This narrow type + cast documents that gap instead of silently widening it. */
type WebBlobLike = { arrayBuffer(): Promise<ArrayBuffer> };

/** Reads the picked asset's bytes — the one place platform specifics are isolated (risk R5):
 * web assets carry a real `File`/Blob (`asset.file`); native assets carry only a `file://` uri,
 * read via expo-file-system's `File`. */
const readPickedFileBytes = async (asset: DocumentPicker.DocumentPickerAsset): Promise<Uint8Array> => {
  const buffer = asset.file
    ? await (asset.file as unknown as WebBlobLike).arrayBuffer()
    : await new File(asset.uri).arrayBuffer();
  return new Uint8Array(buffer);
};

const stageToPanelState: Record<string, PdfUploadPanelState> = {
  idle: 'idle',
  processing: 'loading',
  success: 'content',
};

/**
 * PdfUpload — feature component wiring the document picker, `usePdfExtraction()`, and localized
 * strings to the presentational `PdfUploadPanel`. Mirrors the established `SignInForm`/
 * `LanguageSettings` wiring pattern; error/retry wiring lands in task-12 (Slice 2).
 */
export const PdfUpload = () => {
  const { extract, stage, result } = usePdfExtraction();
  const { t } = useLocalization();

  const handleChooseFile = async () => {
    const picked = await DocumentPicker.getDocumentAsync({ type: PDF_MIME_TYPE });
    if (picked.canceled) return;

    const asset = picked.assets[0];
    const bytes = await readPickedFileBytes(asset);
    await extract({ filename: asset.name, sizeBytes: asset.size ?? bytes.byteLength, bytes });
  };

  return (
    <PdfUploadPanel
      state={stageToPanelState[stage] ?? 'idle'}
      onChooseFile={handleChooseFile}
      filename={result?.filename}
      pageCount={result?.pageCount}
      imageCount={result?.imageCount}
      labels={{
        chooseFile: t('upload.chooseFile'),
        loading: t('upload.loading'),
        filenameLabel: t('upload.filenameLabel'),
        pageCountLabel: t('upload.pageCountLabel'),
        imageCountLabel: t('upload.imageCountLabel'),
        continueLabel: t('upload.continue'),
      }}
    />
  );
};
