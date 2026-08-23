import type { DeviceTokenRepository } from "../../domain/ports/DeviceTokenRepository.js";

export class RegisterDeviceToken {
  constructor(private readonly deviceTokens: DeviceTokenRepository) {}

  async execute(input: {
    token: string;
    platform: "WEB";
    userId: string;
  }): Promise<{ id: string; platform: string; createdAt: Date }> {
    const result = await this.deviceTokens.upsert(input.token, input.userId, input.platform);
    return {
      id: result.id,
      platform: input.platform,
      createdAt: new Date(),
    };
  }
}
