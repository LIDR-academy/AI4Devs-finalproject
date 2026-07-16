export type NewLessonDialogStep = 'upload' | 'generate';

export type NewLessonDialogState = {
  open: boolean;
  step: NewLessonDialogStep;
  documentId: string | undefined;
};

export type NewLessonDialogAction =
  | { type: 'open-upload' }
  | { type: 'open-generate'; documentId: string }
  | { type: 'extracted'; documentId: string }
  | { type: 'close' };

export const initialNewLessonDialogState: NewLessonDialogState = {
  open: false,
  step: 'upload',
  documentId: undefined,
};

export const newLessonDialogReducer = (
  state: NewLessonDialogState,
  action: NewLessonDialogAction,
): NewLessonDialogState => {
  switch (action.type) {
    case 'open-upload':
      return { open: true, step: 'upload', documentId: undefined };
    case 'open-generate':
      return { open: true, step: 'generate', documentId: action.documentId };
    case 'extracted':
      return { open: true, step: 'generate', documentId: action.documentId };
    case 'close':
      return { ...state, open: false };
  }
};
