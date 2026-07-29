const CATALOG_APP_NAME = 'ReadingAnalyticsPlatform';
const CATALOG_APP_VERSION = '1.0';
const DEFAULT_CATALOG_CONTACT = 'github.com/CeliaMerino/AI4Devs-finalproject';

export function buildCatalogUserAgent(contact?: string): string {
  const trimmed = contact?.trim() ?? '';
  const contactPart = trimmed.length > 0 ? trimmed : DEFAULT_CATALOG_CONTACT;
  return `${CATALOG_APP_NAME}/${CATALOG_APP_VERSION} (educational; contact: ${contactPart})`;
}

export const CATALOG_HTTP_USER_AGENT = buildCatalogUserAgent(
  process.env.CATALOG_CONTACT_EMAIL,
);

export const CATALOG_HTTP_HEADERS = {
  'User-Agent': CATALOG_HTTP_USER_AGENT,
  Accept: 'application/json',
} as const;
