export type ApiKeyRequiredNoticeLabels = {
  /** Inline copy explaining an API key is required (AC10). */
  message: string;
  /** Label for the action that navigates to the account screen. */
  action: string;
};

export type ApiKeyRequiredNoticeProps = {
  onNavigateToAccount: () => void;
  labels: ApiKeyRequiredNoticeLabels;
};
