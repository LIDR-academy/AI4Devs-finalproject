export type OpenEndedLabels = {
  submit: string;
  yourAnswer: string;
  modelAnswer: string;
  explanationHeading: string;
  unavailable: string;
  answerInput: string;
};

export type OpenEndedProps = {
  prompt: string;
  modelAnswer: string;
  explanation?: string;
  unavailable?: boolean;
  /** R9 rehydrate: start locked with this text + model answer visible. */
  initialSubmittedAnswer?: string | null;
  maxLength: number;
  labels: OpenEndedLabels;
  onSubmit: (submittedAnswer: string) => void;
};

export type UseOpenEndedProps = {
  initialSubmittedAnswer?: string | null;
  unavailable?: boolean;
  labels: OpenEndedLabels;
};
