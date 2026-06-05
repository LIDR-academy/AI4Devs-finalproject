interface DbArchitectContract {
  caller: string; // default: 'user'
  executionMode: 'solo', 'orchestrated'; // default: 'solo'
  sddPhase: 'design';
  status: string;
  payload: {
    schemaPath: string; // default: 'docs/db/schema.md'
  };
  artifacts: string[];
  ambiguities?: string[];
  edgeCases?: string[];
}