interface JudgmentDayContract {
  caller: string; // default: 'user'
  executionMode: 'solo', 'orchestrated'; // default: 'solo'
  sddPhase: 'verify';
  status: string;
  payload: {
    verdictPath: string; // default: 'docs/qa/judgment_verdict.md'
  };
  artifacts: string[];
  ambiguities?: string[];
  edgeCases?: string[];
}