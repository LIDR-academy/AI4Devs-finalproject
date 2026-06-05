interface SecurityEngineerContract {
  caller: string; // default: 'user'
  executionMode: 'solo', 'orchestrated'; // default: 'solo'
  sddPhase: 'verify';
  status: string;
  payload: {
    auditPath: string; // default: 'docs/security/threat_model.md'
  };
  artifacts: string[];
  ambiguities?: string[];
  edgeCases?: string[];
}