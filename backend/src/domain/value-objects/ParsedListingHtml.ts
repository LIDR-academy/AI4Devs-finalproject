/**
 * ParsedListingHtml value object (T030 + T037 + post-DataDome refactor).
 * Result of fetching + parsing a listing page. Returned by every
 * ListingFetchPort implementation (CheerioAdapter, PlaywrightAdapter,
 * ChainedFetchAdapter). Consumed by AnalyzeListingUseCase.
 *
 * Note: `html` is the raw HTML payload; the domain only needs it as
 * input to other parsers (e.g., location resolution) and never reads
 * it directly. Kept for adapter interop.
 */
export interface ParsedListingHtml {
  url: string;
  html: string;
  text: string;
  declaredAddress?: string;
  declaredNeighbourhood?: string;
  declaredCity?: string;
  price?: number;
  squareMeters?: number;
  rooms?: number;
  yearBuilt?: number;
  energyCertificate?: string;
}
