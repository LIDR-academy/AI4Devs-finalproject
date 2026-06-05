interface WireframeDesignerContract {
  caller: string; // default: 'user'
  executionMode: 'solo', 'orchestrated'; // default: 'solo'
  sddPhase: 'design';
  status: string;
  payload: {
    wireframePath: string; // default: 'docs/design/wireframes/index.html'
  };
  artifacts: string[];
  ambiguities?: string[];
  edgeCases?: string[];
}