export interface AIResponse {
  output: AIOutput[];
  text: {
    format: {
      type: string;
    };
  };
}

export interface AIOutput {
  id: string;
  type: string;
  status: string;
  content: AIContent[];
  role: string;
}

export interface AIContent {
  type: string;
  annotations: any[];
  text: string;
} 