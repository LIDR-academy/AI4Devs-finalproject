export interface OutgoingPush {
  content: string;
  data?: Record<string, string>;
}

export interface FailedToken {
  token: string;
  reason: string;
  permanent: boolean;
}

export interface DeliveryOutcome {
  succeeded: string[];
  failed: FailedToken[];
}

export interface NotificationSender {
  send(push: OutgoingPush, tokens: string[]): Promise<DeliveryOutcome>;
}
