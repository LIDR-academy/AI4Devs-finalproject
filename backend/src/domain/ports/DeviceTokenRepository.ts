export interface DeviceTokenRepository {
  upsert(token: string, userId: string, platform: "WEB"): Promise<{ id: string }>;
  listActiveTokens(userId: string): Promise<string[]>;
  deactivate(tokens: string[]): Promise<void>;
}
