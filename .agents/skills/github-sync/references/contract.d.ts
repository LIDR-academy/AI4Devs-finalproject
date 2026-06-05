interface GithubSyncContract {
  caller: string; // default: 'user'
  executionMode: 'solo', 'orchestrated'; // default: 'solo'
  sddPhase: 'tasks';
  status: string;
  payload: {
    syncReportPath: string; // default: 'docs/tech-lead/sync_report.md'
  };
  artifacts: string[];
  ambiguities?: string[];
  edgeCases?: string[];
}