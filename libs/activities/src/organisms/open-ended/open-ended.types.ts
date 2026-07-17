export type OpenEndedProps = {
  prompt: string;
  modelAnswer: string;
  explanation?: string;
  unavailable?: boolean;
  /** R9 rehydrate: start locked with this text + model answer visible. */
  initialSubmittedAnswer?: string | null;
  maxLength: number;
  onSubmit: (submittedAnswer: string) => void;
};

export type UseOpenEndedProps = {
  initialSubmittedAnswer?: string | null;
  unavailable?: boolean;
};
