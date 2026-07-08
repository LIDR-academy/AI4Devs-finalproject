/**
 * ProgressEvents — typed progress event names (T037e, FR-018).
 * Order: fetching_html → resolving_location → analyzing → cross_referencing_cadastro
 */
export type ProgressEvent =
  | 'fetching_html'
  | 'resolving_location'
  | 'analyzing'
  | 'cross_referencing_cadastro'
  | 'done';

export const PROGRESS_EVENT_ORDER: readonly ProgressEvent[] = [
  'fetching_html',
  'resolving_location',
  'analyzing',
  'cross_referencing_cadastro',
  'done',
] as const;

export class ProgressEventBus {
  private listeners = new Set<(event: ProgressEvent, payload?: unknown) => void>();

  subscribe(listener: (event: ProgressEvent, payload?: unknown) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: ProgressEvent, payload?: unknown): void {
    this.listeners.forEach((l) => l(event, payload));
  }
}
