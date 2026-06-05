interface PrdGeneratorContract {
  caller: string; // default: 'user'
  executionMode: 'solo', 'orchestrated'; // default: 'solo'
  sddPhase: 'specs';
  status: string;
  payload: {
    prdPath: string; // default: 'docs/prd/PRD.md'
  };
  artifacts: string[];
  ambiguities?: string[];
  edgeCases?: string[];
}