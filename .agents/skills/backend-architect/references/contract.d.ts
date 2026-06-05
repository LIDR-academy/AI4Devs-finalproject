interface BackendArchitectContract {
  caller: string; // default: 'user'
  executionMode: 'solo', 'orchestrated'; // default: 'solo'
  sddPhase: 'apply';
  status: string;
  payload: {
    apiPath: string; // default: 'src/backend/'
  };
  artifacts: string[];
  ambiguities?: string[];
  edgeCases?: string[];
}