interface A11YTestingContract {
  caller: string; // default: 'user'
  executionMode: 'solo', 'orchestrated'; // default: 'solo'
  sddPhase: 'verify';
  status: string;
  payload: {
    a11yReportPath: string; // default: 'docs/qa/a11y_report.md'
  };
  artifacts: string[];
  ambiguities?: string[];
  edgeCases?: string[];
}