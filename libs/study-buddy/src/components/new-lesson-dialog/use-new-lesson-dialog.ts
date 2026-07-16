import { useCallback, useEffect, useReducer } from 'react';

import { usePdfUpload } from '../pdf-upload/use-pdf-upload';
import type { NewLessonDialogProps } from './new-lesson-dialog.types';
import {
  initialNewLessonDialogState,
  newLessonDialogReducer,
} from './use-new-lesson-dialog.reducer';

/**
 * Dialog open/step/documentId + pdf upload chooseFile (must stay on the trigger press).
 */
export const useNewLessonDialog = ({
  onExtracted,
  generateDocumentId,
  onGenerateHandled,
}: Pick<NewLessonDialogProps, 'onExtracted' | 'generateDocumentId' | 'onGenerateHandled'>) => {
  const [state, dispatch] = useReducer(newLessonDialogReducer, initialNewLessonDialogState);

  const handleExtracted = useCallback(
    (documentId: string) => {
      dispatch({ type: 'extracted', documentId });
      onExtracted?.(documentId);
    },
    [onExtracted],
  );

  const { chooseFile, panelProps, resetUpload } = usePdfUpload({
    onExtracted: handleExtracted,
  });

  useEffect(() => {
    if (!generateDocumentId) return;
    dispatch({ type: 'open-generate', documentId: generateDocumentId });
    onGenerateHandled?.();
  }, [generateDocumentId, onGenerateHandled]);

  const handleUploadPress = useCallback(() => {
    resetUpload();
    dispatch({ type: 'open-upload' });
    void chooseFile();
  }, [chooseFile, resetUpload]);

  const handleClose = useCallback(() => {
    dispatch({ type: 'close' });
  }, []);

  return {
    open: state.open,
    step: state.step,
    documentId: state.documentId,
    panelProps,
    handleUploadPress,
    handleClose,
  };
};
