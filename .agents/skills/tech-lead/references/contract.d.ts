interface TechLeadContract {
  caller: string; // default: 'user'
  executionMode: 'solo', 'orchestrated'; // default: 'solo'
  sddPhase: 'tasks';
  status: string;
  payload: {
    backlogPath: string; // default: 'docs/tech-lead/backlog.md'
  };
  artifacts: string[];
  ambiguities?: string[];
  edgeCases?: string[];
}