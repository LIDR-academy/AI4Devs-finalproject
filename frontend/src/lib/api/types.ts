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
    diff: ListingDiff | null;
    createdAt: string;
  };
  processSummary: {
    processId: string;
    propertyPrice: number | null;
    currentStage: string;
    isNewProcess: boolean;
  };
}

export interface DashboardProcess {
  id: string;
  status: string;
  currentStage: string;
  propertyPrice: number | string | null;
  financialProfile: Record<string, unknown> | null;
  updatedAt: string;
}

export interface DashboardListing {
  id: string;
  url: string;
  transparencyScore: number;
  scoreLabel: string;
  redFlagsCount: number;
  diff: ListingDiff | null;
  createdAt: string;
}

export interface DashboardChecklist {
  id: string;
  progress: number;
  completedItems: number;
  totalItems: number;
}

export type DashboardResponse =
  | {
      empty: true;
      ctas?: { label: string; href: string }[];
    }
  | {
      empty: false;
      process: DashboardProcess;
      latestListing: DashboardListing | null;
      checklist: DashboardChecklist | null;
      computed: ComputedMortgage | null;
    };

export interface TimelineMilestone {
  stage: string;
  title: string;
  description: string;
  estimatedDays: number;
  documentsNeeded: string[];
}

export interface AmortizationScenario {
  name: string;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  yearsToPayoff: number;
  yearsReduced: number;
  monthlyExtra: number;
}

export interface InvestmentScenario {
  name: string;
  annualReturn: number;
  nominalValue: number;
  realValue: number;
  totalContributed: number;
}

export type Persona = 'conservador' | 'equilibrado' | 'arriesgado';

export interface HiddenCostItem {
  concept: string;
  amount: number;
}

export interface HiddenCosts {
  itpOrIva: number;
  notaria: number;
  registro: number;
  gestoria: number;
  tasacion: number;
  total: number;
  breakdown: HiddenCostItem[];
}

export interface ComputedMortgage {
  hiddenCosts: HiddenCosts;
  totalCash: number;
  gap: number;
  monthlyPayment30yr: number;
  amortizationScenarios: AmortizationScenario[];
  investmentScenarios: InvestmentScenario[];
}

export interface PurchaseProcessDetail {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  currentStage: string;
  propertyPrice: number | string | null;
  sourceListingId: string | null;
  financialProfile: {
    savings: number;
    monthlyIncome: number;
    existingDebts: number;
    region: string;
    persona?: Persona;
    interestRate?: number;
    isFirstHome?: boolean;
    buyerAge?: number | null;
    isProtectedHousing?: boolean;
  } | null;
  computed: ComputedMortgage | null;
  createdAt: string;
  updatedAt: string;
}

export interface NegotiationResponse {
  points: NegotiationPoint[];
}

export interface NegotiationPoint {
  category: string;
  question: string;
  rationale: string;
}

export type ListingDiff =
  | { unchanged: true; addedRedFlags: NegotiationPoint[]; removedRedFlags: NegotiationPoint[] }
  | {
      unchanged: false;
      priceDelta?: number;
      squareMetersDelta?: number;
      yearBuiltChanged?: boolean;
      addedRedFlags: NegotiationPoint[];
      removedRedFlags: NegotiationPoint[];
    };

export type ProgressEventName =
  | 'fetching_html'
  | 'resolving_location'
  | 'analyzing'
  | 'cross_referencing_cadastro'
  | 'done';

export interface ProgressEvent {
  event: ProgressEventName;
  payload: unknown;
  timestamp: string;
}
