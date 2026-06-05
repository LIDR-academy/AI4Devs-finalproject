interface E2ETestingContract {
  caller: string; // default: 'user'
  executionMode: 'solo', 'orchestrated'; // default: 'solo'
  sddPhase: 'verify';
  status: string;
  payload: {
    e2eResultsPath: string; // default: 'docs/qa/e2e_results.json'
  };
  artifacts: string[];
  ambiguities?: string[];
  edgeCases?: string[];
}