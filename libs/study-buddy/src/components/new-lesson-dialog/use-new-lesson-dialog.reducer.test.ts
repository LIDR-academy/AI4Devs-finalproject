import {
  initialNewLessonDialogState,
  newLessonDialogReducer,
} from './use-new-lesson-dialog.reducer';

describe('newLessonDialogReducer', () => {
  it('opens upload step and clears documentId', () => {
    const prev = {
      open: true,
      step: 'generate' as const,
      documentId: 'doc-1',
    };
    expect(newLessonDialogReducer(prev, { type: 'open-upload' })).toEqual({
      open: true,
      step: 'upload',
      documentId: undefined,
    });
  });

  it('opens generate step with documentId', () => {
    expect(
      newLessonDialogReducer(initialNewLessonDialogState, {
        type: 'open-generate',
        documentId: 'doc-2',
      }),
    ).toEqual({ open: true, step: 'generate', documentId: 'doc-2' });
  });

  it('transitions to generate after extract', () => {
    const uploading = { open: true, step: 'upload' as const, documentId: undefined };
    expect(newLessonDialogReducer(uploading, { type: 'extracted', documentId: 'doc-3' })).toEqual({
      open: true,
      step: 'generate',
      documentId: 'doc-3',
    });
  });

  it('closes without clearing step/documentId', () => {
    const open = { open: true, step: 'generate' as const, documentId: 'doc-4' };
    expect(newLessonDialogReducer(open, { type: 'close' })).toEqual({
      open: false,
      step: 'generate',
      documentId: 'doc-4',
    });
  });
});
