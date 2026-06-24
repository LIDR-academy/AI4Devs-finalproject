export interface ExpiryItem {
  name: string;
  expirationDate: Date;
}

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  body: string;
}

export interface SesPort {
  sendEmail(params: { to: string; subject: string; htmlBody: string }): Promise<void>;
}

export interface WebPushPort {
  sendNotification(subscription: PushSubscriptionData, payload: PushPayload): Promise<void>;
}

export const SES_PORT = "SES_PORT";
export const WEB_PUSH_PORT = "WEB_PUSH_PORT";
