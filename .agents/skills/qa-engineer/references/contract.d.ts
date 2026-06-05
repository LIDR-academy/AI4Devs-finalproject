interface QaEngineerContract {
  caller: string; // default: 'user'
  executionMode: 'solo', 'orchestrated'; // default: 'solo'
  sddPhase: 'verify';
  status: string;
  payload: {
    qaReportPath: string; // default: 'docs/qa/qa_report.md'
  };
  artifacts: string[];
  ambiguities?: string[];
  edgeCases?: string[];
}