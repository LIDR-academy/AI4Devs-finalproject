/**
 * ChainedFetchAdapter — composes multiple ListingFetchPort implementations
 * in order. First adapter that returns a result wins. If all throw
 * PortalBlockedError, the chain re-throws the last error. Non-PORTAL_BLOCKED
 * errors propagate immediately (do not fall through).
 */
import { PortalBlockedError } from '../../domain/errors/DomainError';
import type { ListingFetchPort } from '../../domain/ports/ListingFetchPort';
import type { ParsedListingHtml } from '../../domain/value-objects/ParsedListingHtml';

export class ChainedFetchAdapter implements ListingFetchPort {
  constructor(private readonly chain: ListingFetchPort[]) {}

  async fetch(url: string): Promise<ParsedListingHtml> {
    let lastError: unknown = null;
    for (const adapter of this.chain) {
      try {
        return await adapter.fetch(url);
      } catch (err) {
        if (!(err instanceof PortalBlockedError)) throw err;
        lastError = err;
      }
    }
    throw lastError ?? new PortalBlockedError(url);
  }
}
