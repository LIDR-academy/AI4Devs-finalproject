import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { QuoteDraft, QuoteRequest, QuoteResponse, TattooStyleOption } from '../../../core/models/quote.models';
import { AuthService } from '../../../core/services/auth.service';

const STORAGE_PREFIX = 'inklink.quote.';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  /** In-memory drafts for this session, keyed by artistProfileId (CA8). */
  private readonly drafts = signal<Record<string, QuoteDraft>>({});

  getStyles(): Observable<TattooStyleOption[]> {
    return this.http.get<TattooStyleOption[]>(`${environment.apiUrl}/styles`);
  }

  calculate(request: QuoteRequest): Observable<QuoteResponse> {
    return this.http.post<QuoteResponse>(`${environment.apiUrl}/quotes/calculate`, request);
  }

  /** CA7 — keeps the quote for the session; persisted in localStorage when authenticated. */
  saveDraft(draft: QuoteDraft): void {
    this.drafts.update(all => ({ ...all, [draft.request.artistProfileId]: draft }));
    if (this.authService.isAuthenticated()) {
      try {
        localStorage.setItem(STORAGE_PREFIX + draft.request.artistProfileId, JSON.stringify(draft));
      } catch {
        // storage full/unavailable: the in-memory draft still covers the session
      }
    }
  }

  /** CA8 — draft consumed by the booking flow when the client holds a slot. */
  draftFor(artistProfileId: string): QuoteDraft | null {
    const inMemory = this.drafts()[artistProfileId];
    if (inMemory) {
      return inMemory;
    }
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + artistProfileId);
      return raw ? (JSON.parse(raw) as QuoteDraft) : null;
    } catch {
      return null;
    }
  }

  clearDraft(artistProfileId: string): void {
    this.drafts.update(all => {
      const { [artistProfileId]: _removed, ...rest } = all;
      return rest;
    });
    try {
      localStorage.removeItem(STORAGE_PREFIX + artistProfileId);
    } catch {
      // ignore storage errors
    }
  }
}
