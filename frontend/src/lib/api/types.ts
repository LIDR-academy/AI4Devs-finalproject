export type RedFlagType =
  | 'euphemistic_language'
  | 'vague_location'
  | 'missing_energy_certificate'
  | 'inflated_square_meters'
  | 'no_floor_plan'
  | 'suspicious_price'
  | 'stale_listing'
  | 'missing_community_costs'
  | 'hidden_fees_mentioned'
  | 'photos_mismatch'
  | 'missing_year_built'
  | 'missing_orientation';

export type RedFlagSeverity = 'low' | 'medium' | 'high';

export interface RedFlagItem {
  flag: RedFlagType;
  severity: RedFlagSeverity;
  reasoning: string;
}

export interface AnalyzeListingResponse {
  listing: {
    id: string;
    url: string;
    transparencyScore: number;
    scoreLabel: 'baja' | 'media' | 'alta' | 'excelente';
    redFlags: RedFlagItem[];
    summary: string | null;
    declaredAddress: string | null;
    coordinates: { lat: number; lng: number; source: string; confidence: number } | null;
    catastroMatch: { cadastralReference: string; officialSquareMeters: number; yearBuilt: number | null; address: string; matched: boolean } | null;
    createdAt: string;
  };
  processSummary: {
    processId: string;
    propertyPrice: number | null;
    currentStage: string;
    isNewProcess: boolean;
  };
}

export interface DashboardResponse {
  empty: boolean;
  ctas?: { label: string; href: string }[];
  process?: {
    id: string;
    status: string;
    currentStage: string;
    propertyPrice: number | null;
    financialProfile: Record<string, unknown> | null;
    updatedAt: string;
  };
  latestListing?: {
    id: string;
    url: string;
    transparencyScore: number;
    scoreLabel: string;
    redFlagsCount: number;
    createdAt: string;
  };
  checklist?: {
    id: string;
    progress: number;
    completedItems: number;
    totalItems: number;
  };
}

export interface NegotiationPoint {
  category: string;
  question: string;
  rationale: string;
}

export interface TimelineMilestone {
  stage: string;
  title: string;
  description: string;
  estimatedDays: number;
  documentsNeeded: string[];
}
