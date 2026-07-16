import { Button, Dialog, PdfUploadPanel } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';

import { LessonGeneration } from '../lesson-generation/lesson-generation';
import type { NewLessonDialogProps } from './new-lesson-dialog.types';
import { useNewLessonDialog } from './use-new-lesson-dialog';

/**
 * Upload + generate in one dialog: Choose PDF opens dialog + picker; after extract shows
 * LessonGeneration. List Generate opens the same dialog on the generate step.
 */
export const NewLessonDialog = ({
  onExtracted,
  onGenerated,
  generateDocumentId,
  onGenerateHandled,
}: NewLessonDialogProps) => {
  const { t } = useLocalization();
  const { open, step, documentId, panelProps, handleUploadPress, handleClose } = useNewLessonDialog(
    {
      onExtracted,
      generateDocumentId,
      onGenerateHandled,
    },
  );

  const headline = step === 'upload' ? t('upload.dialogHeadline') : t('generation.dialogHeadline');

  return (
    <>
      <Button onPress={handleUploadPress}>{t('upload.chooseFile')}</Button>

      <Dialog
        open={open}
        onClose={handleClose}
        headline={headline}
        actions={
          <Button variant="text" onPress={handleClose}>
            {t('upload.dialogClose')}
          </Button>
        }
      >
        {step === 'upload' ? <PdfUploadPanel {...panelProps} /> : null}
        {step === 'generate' ? (
          <LessonGeneration documentId={documentId} onGenerated={onGenerated} />
        ) : null}
      </Dialog>
    </>
  );
};
