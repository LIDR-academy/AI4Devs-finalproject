/**
 * ListingAnalyzerPort (T030).
 * Adapter: OpenRouterAdapter. Returns LLM analysis of a listing text.
 */
import type { TransparencyScore } from '../value-objects/TransparencyScore';
import type { RedFlags } from '../value-objects/RedFlags';

export interface LLMAnalysisResult {
  transparencyScore: TransparencyScore;
  redFlags: RedFlags;
  omissions: string[];
  positiveSignals: string[];
  summary: string;
}

export interface ListingAnalyzerPort {
  analyze(text: string, url: string): Promise<LLMAnalysisResult>;
}
