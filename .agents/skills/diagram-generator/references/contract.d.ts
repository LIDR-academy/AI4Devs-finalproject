interface DiagramGeneratorContract {
  caller: string; // default: 'user'
  executionMode: 'solo', 'orchestrated'; // default: 'solo'
  sddPhase: 'design';
  status: string;
  payload: {
    diagramsDir: string; // default: 'docs/design/diagrams/'
  };
  artifacts: string[];
  ambiguities?: string[];
  edgeCases?: string[];
}