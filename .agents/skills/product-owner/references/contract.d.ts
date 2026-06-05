interface ProductOwnerContract {
  caller: string; // default: 'user'
  executionMode: 'solo', 'orchestrated'; // default: 'solo'
  sddPhase: 'proposal';
  status: string;
  payload: {
    briefPath: string; // default: 'docs/prd/brief.md'
  };
  artifacts: string[];
  ambiguities?: string[];
  edgeCases?: string[];
}