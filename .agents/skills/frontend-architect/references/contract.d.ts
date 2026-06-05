interface FrontendArchitectContract {
  caller: string; // default: 'user'
  executionMode: 'solo', 'orchestrated'; // default: 'solo'
  sddPhase: 'apply';
  status: string;
  payload: {
    uiPath: string; // default: 'src/components/'
  };
  artifacts: string[];
  ambiguities?: string[];
  edgeCases?: string[];
}