import type { ApiKeyStatus } from '@helsoft/types';

export type ApiKeyFormLabels = {
  inputLabel: string;
  save: string;
  /** Progress label shown (and announced) while a save is in flight (@s2). */
  saving: string;
  /** Announced to assistive tech while the initial status fetch is in flight (WCAG 4.1.3) —
   * not shown visually (mirrors LoginForm's `signingIn`). */
  loadingStatus: string;
  replace: string;
  remove: string;
  /** Fully-formatted masked status text (provider + last-updated) — the wiring layer builds
   * this via `t()` so ApiKeyForm stays free of i18n/date-formatting concerns. */
  keySavedStatus: string;
  /** Empty-state "where to get a key" guidance link text (@s5). */
  guidance: string;
  /** Remove-confirmation Dialog copy (@s8, reuses the SignOut confirm pattern). */
  removeConfirmHeadline: string;
  removeConfirmBody: string;
  removeConfirmAction: string;
  removeConfirmCancelAction: string;
};

export type ApiKeyFormProps = {
  status: ApiKeyStatus;
  /** True while the initial status fetch is in flight (task-7 Loading state). */
  isLoadingStatus?: boolean;
  /** True while a save is in flight (@s2). */
  isSubmitting?: boolean;
  onSave: (rawKey: string) => void;
  onRemove?: () => void;
  /** Where the Empty state's guidance link sends the user (@s5). Injected by the wiring layer
   * (mirrors ApiKeyGate's `onNavigateToAccount`, LoginForm's `onNavigateToSignUp`) rather than
   * hardcoded here, so ApiKeyForm stays free of any provider-specific destination. */
  guidanceUrl: string;
  /**
   * Save/remove failure banner (network_error, @s7/@s9). Rendered alongside whichever state
   * is showing (input or masked saved) — the input stays editable and the masked state stays
   * visible; retry is just resubmitting/re-confirming.
   */
  errorMessage?: string;
  labels: ApiKeyFormLabels;
};
