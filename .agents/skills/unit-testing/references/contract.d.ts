interface UnitTestingContract {
  caller: string; // default: 'user'
  executionMode: 'solo', 'orchestrated'; // default: 'solo'
  sddPhase: 'verify';
  status: string;
  payload: {
    testCoveragePath: string; // default: 'docs/qa/unit_coverage.json'
  };
  artifacts: string[];
  ambiguities?: string[];
  edgeCases?: string[];
}